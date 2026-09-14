import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthType } from '../../enums/auth-type.enum.js';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard.js';
import { AUTH_TYPE_KEY } from '../../constants/auth.constants.js';
import { CookieGuard } from '../cookie/cookie.guard.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  // Define the default authentication method if none is specified by the @Auth() decorator
  private static readonly defaultAuthType = AuthType.Bearer;

  // A dictionary mapping each AuthType to its corresponding Guard implementation
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly cookieGuard: CookieGuard,
  ) {
    // Initialize the mapping between AuthTypes and their specific Guards
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.Cookie]: this.cookieGuard,
      [AuthType.None]: { canActivate: () => true }, // Always allow access for public routes
      [AuthType.ApiKey]: { canActivate: () => false }, // Blocked until ApiKeyGuard is implemented
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Retrieve the requested AuthTypes from the route handler or class metadata
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    // 2. Fetch the corresponding Guard instances based on the requested AuthTypes
    // The .flat() ensures we get a flat array even if a specific AuthType requires multiple guards
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    // 3. Set a default error that will be thrown if all authentication attempts fail
    let error = new UnauthorizedException();

    // 4. Loop through the guards. If ANY guard allows access, the user is authorized.
    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        // Execute the specific guard (e.g., AccessTokenGuard)
        instance.canActivate(context),
      ).catch((err) => {
        // If the guard throws an error (e.g., invalid token), save it and try the next guard
        error = err;
      });

      // If authentication succeeds, immediately allow access without checking the remaining guards
      if (canActivate) {
        return true;
      }
    }

    // 5. If the loop finishes and no guard returned true, throw the last encountered error
    throw error;
  }
}
