import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { RedisKeys } from '../../../redis/redis.keys.js';
import jwtConfig from '../../config/jwt.config.js';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class LogoutProvider {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async logout(accessToken: string, refreshToken: string) {
    try {
      await Promise.all([
        this.blacklistToken(accessToken, this.jwtConfiguration.secret),
        this.blacklistToken(
          refreshToken,
          this.jwtConfiguration.refreshTokenSecret,
        ),
      ]);
      return {
        message: 'Logout successful.',
      };
    } catch {
      throw new UnauthorizedException('Failed to log out.');
    }
  }

  private async blacklistToken(token: string, secret: string) {
    if (!token) return;

    try {
      const decodedToken = await this.jwtService.verifyAsync<{
        exp: number;
        jti: string;
      }>(token, {
        secret: secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        ignoreExpiration: false,
      });

      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const expiresIn = decodedToken.exp - currentTimeInSeconds;

      if (expiresIn > 0 && decodedToken.jti) {
        const redisKey = RedisKeys.blacklistToken(decodedToken.jti);
        await this.redisClient.set(redisKey, 'true', 'EX', expiresIn);
      }
    } catch (error) {
      throw new InternalServerErrorException('Could not rotate token.');
    }
  }
}
