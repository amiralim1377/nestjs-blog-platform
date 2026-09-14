import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { REQUEST_USER_KEY } from '../../constants/auth.constants.js';
import { AuthService } from '../../providers/auth.service.js';

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
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extract the HTTP request object from the execution context
    const request = context.switchToHttp().getRequest();

    // 2. Extract the token from the Authorization header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not provided in headers');
    }

    let payload: any;

    // 3. Verify the token (checks signature and expiration automatically)
    try {
      payload = await this.authService.validateTokenAndCheckBlacklist(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
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
