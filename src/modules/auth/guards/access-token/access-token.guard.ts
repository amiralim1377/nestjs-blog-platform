import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config.js';
import type { Request } from 'express';
import { REQUEST_USER_KEY } from '../../constants/auth.constants.js';

/**
 * Guard responsible for validating JWT Access Tokens.
 * It extracts the token from the request header, verifies it,
 * and attaches the decoded user payload to the request object.
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    // Service to handle JWT verification
    private readonly jwtService: JwtService,
    // Injecting custom JWT configuration (e.g., secret key, expiration times)
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extract the HTTP request object from the execution context
    const request = context.switchToHttp().getRequest();

    // 2. Extract the token from the Authorization header
    const token = this.extractTokenFromHeader(request);

    // 3. If no token is found, deny access immediately
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      // 4. Verify the token using the secret and configuration options.
      // verifyAsync will automatically throw an error if the token is invalid or expired.
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      // 5. Attach the decoded payload to the request object.
      // This makes the user data available to controllers in subsequent steps.
      request[REQUEST_USER_KEY] = payload;
    } catch {
      // Catch validation errors and throw a standard 401 Unauthorized response
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 6. If everything is successful, allow the request to proceed
    return true;
  }

  /**
   * Helper method to extract the JWT token from the standard 'Authorization' header.
   * Expects the format: "Bearer <token>"
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    // Split the header value by space. Defaults to an empty array if undefined.
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    // Return the token only if the type is exactly 'Bearer', otherwise return undefined
    return type === 'Bearer' ? token : undefined;
  }
}
