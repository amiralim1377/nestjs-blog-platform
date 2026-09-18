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
  Patch,
  Param,
} from '@nestjs/common';
import { AuthService } from './providers/auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Auth } from './decorator/auth.decorator.js';
import { AuthType } from './enums/auth-type.enum.js';
import { CookieProvider } from './providers/cookie/cookie.provider.js';
import type { Request, Response } from 'express';
import { AuthCreateUserDto } from './dto/create-user.dto.js';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { ActiveUserData } from './interfaces/active-user-data.interface.js';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto.js';
import { ActiveUser } from './decorator/active-user.decorator.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';

@ApiTags('Auth')
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
  @ApiOperation({ summary: 'Registers a new user account.' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or user already exists.',
  })
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
  @ApiOperation({
    summary: 'Authenticates a user and returns access/refresh tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials / Unauthorized.',
  })
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
  @ApiOperation({
    summary: 'Logs out the authenticated user and clears cookies.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Headers('authorization') authHeader?: string,
  ) {
    const accessToken = authHeader
      ? authHeader.split(' ')[1]
      : request.cookies?.['accessToken'];
    const refreshToken = request.cookies?.['refreshToken'];

    const result = await this.authService.logout(accessToken, refreshToken);

    this.cookieProvider.clearRefreshTokenCookie(response);
    this.cookieProvider.clearAccessTokenCookie(response);

    return result;
  }

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.None)
  @ApiOperation({
    summary: 'Generates new access and refresh tokens via cookie.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token missing or invalid.',
  })
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Initiates the password reset process.' })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent to email (if exists).',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
  })
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Resets the user password using a token.' })
  @ApiResponse({
    status: 200,
    description: 'Password has been reset successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token.',
  })
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch(':userId/password')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Updates a user password.' })
  @ApiResponse({
    status: 200,
    description: 'User password updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid password format.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  public async updatePassword(
    @Param('userId') userId: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.authService.updatePassword(userId, updateUserPasswordDto, user);
  }
}
