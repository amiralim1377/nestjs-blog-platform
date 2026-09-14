import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  Res,
  UnauthorizedException,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './providers/auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Auth } from './decorator/auth.decorator.js';
import { AuthType } from './enums/auth-type.enum.js';
import { CookieProvider } from './providers/cookie/cookie.provider.js';
import type { Request, Response } from 'express';
import { AuthCreateUserDto } from './dto/createUser.dto.js';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieProvider: CookieProvider,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(
    @Body() createUserDto: AuthCreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(createUserDto);

    this.cookieProvider.setRefreshTokenCookie(response, result.refreshToken);
    this.cookieProvider.setAccessTokenCookie(response, result.accessToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(loginDto);

    this.cookieProvider.setRefreshTokenCookie(response, tokens.refreshToken);
    this.cookieProvider.setAccessTokenCookie(response, tokens.accessToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async logout(
    @Headers('authorization') authHeader: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = authHeader.split(' ')[1];
    const refreshToken = request.cookies?.['refreshToken'];

    const result = await this.authService.logout(accessToken, refreshToken);

    this.cookieProvider.clearRefreshTokenCookie(response);
    this.cookieProvider.clearAccessTokenCookie(response);

    return result;
  }

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.None)
  async createRefreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing from cookies.');
    }

    const tokens = await this.authService.refreshTokens({ refreshToken });

    this.cookieProvider.setRefreshTokenCookie(response, tokens.refreshToken);
    this.cookieProvider.setAccessTokenCookie(response, tokens.accessToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
