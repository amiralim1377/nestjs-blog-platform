import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { RedisKeys } from '../../../redis/redis.keys.js';

@Injectable()
export class LogoutProvider {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    private readonly jwtService: JwtService,
  ) {}

  async logout(accessToken: string) {
    try {
      const decodedToken = this.jwtService.decode(accessToken) as {
        exp: number;
      } | null;

      if (!decodedToken || !decodedToken.exp) {
        throw new UnauthorizedException('Invalid or malformed token.');
      }

      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const expiresIn = decodedToken.exp - currentTimeInSeconds;

      if (expiresIn > 0) {
        const redisKey = RedisKeys.blacklistToken(accessToken);

        await this.redisClient.set(redisKey, 'true', 'EX', expiresIn);
      }

      return {
        message: 'Logout successful.',
      };
    } catch {
      throw new UnauthorizedException('Failed to log out.');
    }
  }
}
