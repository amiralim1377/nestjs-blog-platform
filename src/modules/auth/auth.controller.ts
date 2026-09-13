import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './providers/auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { Auth } from './decorator/auth.decorator.js';
import { AuthType } from './enums/auth-type.enum.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer)
  async logout(@Headers('authorization') authHeader: string) {
    const accessToken = authHeader.split(' ')[1];
    return this.authService.logout(accessToken);
  }

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.None)
  async createRefreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
