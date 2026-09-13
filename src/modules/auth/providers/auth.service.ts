import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto.js';
import { LoginProvider } from './authentication/login.provider.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { RefreshTokensProvider } from './authentication/refresh-tokens.provider.js';
import { LogoutProvider } from './authentication/logout-provider.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginProvider: LoginProvider,
    private readonly refreshTokenProvider: RefreshTokensProvider,
    private readonly logoutProvider: LogoutProvider,
  ) {}

  async login(loginDto: LoginDto) {
    return await this.loginProvider.login(loginDto);
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshTokens(refreshTokenDto);
  }

  async logout(accessToken: string, refreshToken: string) {
    return await this.logoutProvider.logout(accessToken, refreshToken);
  }
}
