import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { UsersService as UsersServiceType } from '../../../users/providers/users.service.js';
import { UsersService } from '../../../users/providers/users.service.js';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { GenerateTokensProvider } from '../tokens/generate-tokens.provider.js';
import { RefreshTokenDto } from '../../dto/refresh-token.dto.js';
import type { ActiveUserData } from '../../interfaces/active-user-data.interface.js';
import type { Redis } from 'ioredis';
import { RedisKeys } from '../../../redis/redis.keys.js';

interface RefreshTokenPayload extends ActiveUserData {
  jti: string;
  exp: number;
  familyId?: string;
}

@Injectable()
export class RefreshTokensProvider {
  private readonly logger = new Logger(RefreshTokensProvider.name);
  private readonly MAX_FAMILY_REVOCATION_TTL = 7 * 24 * 60 * 60; // 7 days
  private readonly ROTATION_GRACE_PERIOD_SECONDS = 30; // 30 seconds leeway window for concurrent requests
  private readonly LOCK_TIMEOUT_SECONDS = 5; // In-flight mutex timeout

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersServiceType,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly generateTokensProvider: GenerateTokensProvider,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    let decodedToken: RefreshTokenPayload;

    try {
      decodedToken = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: this.jwtConfiguration.refreshTokenSecret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const { sub, jti, exp, familyId } = decodedToken;

    if (!jti) {
      this.logger.warn(`Token missing JTI payload for user: ${sub}`);
      throw new UnauthorizedException('Malformed token payload.');
    }

    const actualFamilyId = familyId || sub.toString();
    const familyRevocationKey = RedisKeys.revokeTokenFamily(actualFamilyId);
    const rotatedTokenKey = RedisKeys.rotatedToken(jti);
    const blacklistKey = RedisKeys.blacklistToken(jti);
    const lockKey = RedisKeys.tokenRotationLock(jti);

    // 1. Verify if the entire token family was revoked (e.g. previous confirmed breach or explicit logout)
    let isFamilyRevoked: string | null = null;
    try {
      isFamilyRevoked = await this.redisClient.get(familyRevocationKey);
    } catch (error) {
      this.logger.error(
        `Redis Error (GET) family status for: ${actualFamilyId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to verify security status.',
      );
    }

    if (isFamilyRevoked) {
      this.logger.warn(
        `Blocked attempt to use revoked token family: ${actualFamilyId} by user: ${sub}`,
      );
      throw new UnauthorizedException(
        'Security breach detected. Please log in again.',
      );
    }

    // 2. Check Grace Period Cache:
    // If concurrent requests (e.g., parallel SPA API calls on 401) arrive with the same JTI,
    // return the exact same rotated token pair instead of falsely triggering a security breach!
    try {
      const cachedTokens = await this.redisClient.get(rotatedTokenKey);
      if (cachedTokens) {
        this.logger.log(
          `Serving concurrent refresh request from grace period cache for jti: ${jti}`,
        );
        return JSON.parse(cachedTokens);
      }
    } catch (error) {
      this.logger.error(`Redis Error (GET) rotatedTokenKey for: ${jti}`, error);
    }

    // 3. Distributed Mutual Exclusion Lock:
    // Ensure only ONE concurrent request rotates this specific token at a time
    let lockAcquired = false;
    try {
      const lockResult = await this.redisClient.set(
        lockKey,
        '1',
        'EX',
        this.LOCK_TIMEOUT_SECONDS,
        'NX',
      );
      lockAcquired = lockResult === 'OK';
    } catch (error) {
      this.logger.error(
        `Redis Error acquiring rotation lock for: ${jti}`,
        error,
      );
    }

    // If lock was not acquired, wait briefly for the in-flight rotation to complete and serve from cache
    if (!lockAcquired) {
      for (let attempt = 0; attempt < 25; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        try {
          const cachedTokensAfterWait =
            await this.redisClient.get(rotatedTokenKey);
          if (cachedTokensAfterWait) {
            return JSON.parse(cachedTokensAfterWait);
          }
        } catch (error) {
          this.logger.error(
            `Redis Error polling rotatedTokenKey for: ${jti}`,
            error,
          );
        }
      }
    }

    try {
      // 4. Blacklist / Replay Detection:
      // If the token is already blacklisted AND not found in the grace period cache,
      // this is a genuine replay attack (compromised token reused after grace period).
      let isBlacklisted: string | null = null;
      try {
        isBlacklisted = await this.redisClient.get(blacklistKey);
      } catch (error) {
        this.logger.error(
          `Redis Error (GET) blacklist status for jti: ${jti}`,
          error,
        );
        throw new InternalServerErrorException(
          'Failed to verify token status.',
        );
      }

      if (isBlacklisted) {
        this.logger.error(
          `SECURITY ALERT: Replay attack detected for user ${sub} / family ${actualFamilyId}. Revoking entire family.`,
        );

        try {
          await this.redisClient.set(
            familyRevocationKey,
            'true',
            'EX',
            this.MAX_FAMILY_REVOCATION_TTL,
          );
        } catch (error) {
          this.logger.error(
            `Redis Error (SET) failed to revoke token family: ${actualFamilyId}`,
            error,
          );
        }

        throw new UnauthorizedException(
          'Security breach detected. All your sessions have been revoked.',
        );
      }

      // 5. Generate New Tokens
      const user = await this.usersService.findById(sub);
      if (!user) {
        throw new UnauthorizedException('User no longer exists.');
      }

      const newTokens = await this.generateTokensProvider.generateTokens(
        user,
        actualFamilyId,
      );

      // 6. Blacklist old token & populate grace period cache
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const expiresIn = exp - currentTimeInSeconds;

      try {
        if (expiresIn > 0) {
          await this.redisClient.set(blacklistKey, 'true', 'EX', expiresIn);
        }

        // Cache the newly minted tokens in Redis for the grace period window (30s)
        await this.redisClient.set(
          rotatedTokenKey,
          JSON.stringify(newTokens),
          'EX',
          this.ROTATION_GRACE_PERIOD_SECONDS,
        );
      } catch (error) {
        this.logger.error(
          `Redis Error updating token rotation status for jti: ${jti}`,
          error,
        );
        throw new InternalServerErrorException(
          'Could not process token rotation.',
        );
      }

      return newTokens;
    } finally {
      // 7. Always release the lock if it was acquired by this execution
      if (lockAcquired) {
        try {
          await this.redisClient.del(lockKey);
        } catch (error) {
          this.logger.error(`Redis Error releasing lock for: ${jti}`, error);
        }
      }
    }
  }
}
