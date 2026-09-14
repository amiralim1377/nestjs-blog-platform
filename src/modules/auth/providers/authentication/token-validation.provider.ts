import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import jwtConfig from '../../config/jwt.config.js';
import { RedisKeys } from '../../../redis/redis.keys.js';

@Injectable()
export class ValidateTokenAndCheckBlacklistProvider {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async validateTokenAndCheckBlacklist(token: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token, this.jwtConfiguration);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.jti) {
      let isBlacklisted: string | null;

      try {
        isBlacklisted = await this.redisClient.get(
          RedisKeys.blacklistToken(payload.jti),
        );
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to check token blacklist status.',
        );
      }

      if (isBlacklisted) {
        throw new UnauthorizedException(
          'Session revoked. Please log in again.',
        );
      }
    }

    return payload;
  }
}
