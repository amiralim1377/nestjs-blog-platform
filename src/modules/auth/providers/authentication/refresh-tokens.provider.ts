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
  private readonly MAX_FAMILY_REVOCATION_TTL = 7 * 24 * 60 * 60;

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
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const { sub, jti, exp, familyId } = decodedToken;

    if (!jti) {
      this.logger.warn(`Token missing JTI payload for user: ${sub}`);
      throw new UnauthorizedException('Malformed token payload.');
    }

    const actualFamilyId = familyId || sub.toString();
    const blacklistKey = RedisKeys.blacklistToken(jti);

    const familyRevocationKey =
      'revokeTokenFamily' in RedisKeys
        ? (RedisKeys as any).revokeTokenFamily(actualFamilyId)
        : `revoked_family:${actualFamilyId}`;

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

    let isBlacklisted: string | null = null;
    try {
      isBlacklisted = await this.redisClient.get(blacklistKey);
    } catch (error) {
      this.logger.error(
        `Redis Error (GET) blacklist status for jti: ${jti}`,
        error,
      );
      throw new InternalServerErrorException('Failed to verify token status.');
    }

    if (isBlacklisted) {
      this.logger.error(
        `SECURITY ALERT: Token reuse detected for user ${sub} / family ${actualFamilyId}. Revoking entire family.`,
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

    const user = await this.usersService.findById(sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const expiresIn = exp - currentTimeInSeconds;

    if (expiresIn > 0) {
      try {
        await this.redisClient.set(blacklistKey, 'true', 'EX', expiresIn);
      } catch (error) {
        this.logger.error(
          `Redis Error (SET) failed to blacklist rotated token jti: ${jti}`,
          error,
        );
        throw new InternalServerErrorException(
          'Could not process token rotation.',
        );
      }
    }

    return await this.generateTokensProvider.generateTokens(
      user,
      actualFamilyId,
    );
  }
}
