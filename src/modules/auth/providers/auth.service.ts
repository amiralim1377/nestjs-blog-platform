import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto.js';
import { LoginProvider } from './authentication/login.provider.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { RefreshTokensProvider } from './authentication/refresh-tokens.provider.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginProvider: LoginProvider,
    private readonly refreshTokenProvider: RefreshTokensProvider,
  ) {}

  async login(loginDto: LoginDto) {
    return await this.loginProvider.login(loginDto);
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshTokens(refreshTokenDto);
  }
}
