import { AUTH_TYPE_KEY } from '../constants/auth.constants.js';
import { AuthType } from '../enums/auth-type.enum.js';
import { SetMetadata } from '@nestjs/common';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
