import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service.js';
import { AuthController } from './auth.controller.js';
import { HashingProvider } from './providers/hashing/hashing.provider.js';
import { UsersModule } from '../users/users.module.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config.js';
import { ArgonProvider } from './providers/hashing/argon.provider.js';
import { RefreshTokensProvider } from './providers/authentication/refresh-tokens.provider.js';
import { LoginProvider } from './providers/authentication/login.provider.js';
import { GenerateTokensProvider } from './providers/tokens/generate-tokens.provider.js';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication/authentication.guard.js';
import { AccessTokenGuard } from './guards/access-token/access-token.guard.js';
import { LogoutProvider } from './providers/authentication/logout-provider.js';
import { CookieProvider } from './providers/cookie/cookie.provider.js';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginProvider,
    LogoutProvider,
    RefreshTokensProvider,
    GenerateTokensProvider,
    AccessTokenGuard,
    CookieProvider,
    {
      provide: HashingProvider,
      useClass: ArgonProvider,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [HashingProvider],
})
export class AuthModule {}
