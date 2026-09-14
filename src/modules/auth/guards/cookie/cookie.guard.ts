import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../providers/auth.service.js';
import { REQUEST_USER_KEY } from '../../constants/auth.constants.js';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.accessToken;
    if (!token) {
      throw new UnauthorizedException('Token not provided in cookies');
    }

    try {
      request[REQUEST_USER_KEY] =
        await this.authService.validateTokenAndCheckBlacklist(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired cookie token');
    }

    return true;
  }
}
