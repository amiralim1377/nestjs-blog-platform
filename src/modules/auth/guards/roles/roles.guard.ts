import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../users/enums/user-role.enum.js';
import { ROLES_KEY } from '../../decorator/roles.decorator.js';
import { ActiveUserData } from '../../interfaces/active-user-data.interface.js';
import { REQUEST_USER_KEY } from '../../constants/auth.constants.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user: ActiveUserData = request[REQUEST_USER_KEY] || request['user'];

    if (!user) {
      return false;
    }

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'You do not have the required permissions to perform this action.',
      );
    }

    return true;
  }
}
