import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { UsersService as UsersServiceType } from '../../../users/providers/users.service.js';
import { UsersService } from '../../../users/providers/users.service.js';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { GenerateTokensProvider } from '../tokens/generate-tokens.provider.js';
import { RefreshTokenDto } from '../../dto/refresh-token.dto.js';
import { ActiveUserData } from '../../interfaces/active-user-data.interface.js';
import type { Redis } from 'ioredis';
import { RedisKeys } from '../../../redis/redis.keys.js';

@Injectable()
export class RefreshTokensProvider {
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
    let isBlacklisted: string | null;
    try {
      const redisKey = RedisKeys.blacklistToken(refreshTokenDto.refreshToken);
      isBlacklisted = await this.redisClient.get(redisKey);
    } catch (error) {
      throw new InternalServerErrorException('Failed to check token status.');
    }

    if (isBlacklisted) {
      throw new UnauthorizedException('This token has been revoked.');
    }

    try {
      // verify the refresh token using jwtservice
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.refreshTokenSecret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      //fetch user from the database
      const user = await this.usersService.findById(sub);

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      //Token Rotation
      try {
        const decodedToken = this.jwtService.decode<{ exp: number }>(
          refreshTokenDto.refreshToken,
        );

        if (decodedToken && decodedToken.exp) {
          const currentTimeInSeconds = Math.floor(Date.now() / 1000);
          const expiresIn = decodedToken.exp - currentTimeInSeconds;

          if (expiresIn > 0) {
            const redisKey = RedisKeys.blacklistToken(
              refreshTokenDto.refreshToken,
            );
            await this.redisClient.set(redisKey, 'true', 'EX', expiresIn);
          }
        }
      } catch (error) {
        throw new InternalServerErrorException('Could not rotate token.');
      }

      // Generate the tokens
      return await this.generateTokensProvider.generateTokens(user);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}
