import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config.js';
import type { Request } from 'express';
import { REQUEST_USER_KEY } from '../../constants/auth.constants.js';
import type { Redis } from 'ioredis';
import { RedisKeys } from '../../../redis/redis.keys.js';

/**
 * Guard responsible for validating JWT Access Tokens.
 * Responsibilities:
 * 1. Extract the token from the request header.
 * 2. Verify the digital signature and expiration date.
 * 3. Check if the token's unique ID (JTI) is in the Redis blacklist.
 * 4. Attach the decoded user payload to the Request object for later use.
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extract the HTTP request object from the execution context
    const request = context.switchToHttp().getRequest();

    // 2. Extract the token from the Authorization header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    let payload: any;

    // 3. Verify the token (checks signature and expiration automatically)
    try {
      payload = await this.jwtService.verifyAsync(token, this.jwtConfiguration);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 4. Check the Blacklist in Redis using the JTI standard
    if (payload.jti) {
      let isBlacklisted: string | null;

      try {
        // NOTE: We pass the short 'jti' payload instead of the raw long token
        const redisKey = RedisKeys.blacklistToken(payload.jti);
        isBlacklisted = await this.redisClient.get(redisKey);
      } catch {
        throw new InternalServerErrorException(
          'Failed to check token blacklist status.',
        );
      }

      // If the JTI exists in Redis, it means the session has been revoked
      if (isBlacklisted) {
        throw new UnauthorizedException(
          'Your session has been revoked. Please log in again.',
        );
      }
    }

    // 5. Attach the decoded payload to the request object.
    // Controllers can now access this data (e.g., using a custom @ActiveUser() decorator)
    request[REQUEST_USER_KEY] = payload;

    // 6. Grant access to the route
    return true;
  }

  /**
   * Helper method to extract the JWT token from the standard 'Authorization' header.
   * Expected format: "Bearer <token>"
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
