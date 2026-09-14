import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto.js';
import { LoginProvider } from './authentication/login-provider.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { RefreshTokensProvider } from './authentication/refresh-tokens.provider.js';
import { LogoutProvider } from './authentication/logout-provider.js';
import { AuthCreateUserDto } from '../dto/create-user.dto.js';
import { RegisterProvider } from './authentication/register-provider.js';
import { ValidateTokenAndCheckBlacklistProvider } from './authentication/token-validation.provider.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginProvider: LoginProvider,
    private readonly refreshTokenProvider: RefreshTokensProvider,
    private readonly logoutProvider: LogoutProvider,
    private readonly registerProvider: RegisterProvider,
    private readonly validateTokenAndCheckBlacklistProvider: ValidateTokenAndCheckBlacklistProvider,
  ) {}

  async register(createUserDto: AuthCreateUserDto) {
    return await this.registerProvider.register(createUserDto);
  }

  async login(loginDto: LoginDto) {
    return await this.loginProvider.login(loginDto);
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshTokens(refreshTokenDto);
  }

  async logout(accessToken: string, refreshToken: string) {
    return await this.logoutProvider.logout(accessToken, refreshToken);
  }

  async validateTokenAndCheckBlacklist(token: string) {
    return this.validateTokenAndCheckBlacklistProvider.validateTokenAndCheckBlacklist(
      token,
    );
  }
}
