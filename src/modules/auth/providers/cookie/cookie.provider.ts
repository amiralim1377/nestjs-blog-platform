import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieProvider {
  /**
   * Sets a secure HTTP-only cookie for the refresh token.
   */
  public setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
      sameSite: 'lax', // Helps protect against CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires after 7 days
    });
  }

  public setAccessTokenCookie(response: Response, accessToken: string): void {
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
  }

  /**
   * Clears the refresh token cookie during logout.
   */
  public clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refreshToken');
  }

  /**
   * Clears the access token cookie during logout.
   */
  public clearAccessTokenCookie(response: Response): void {
    response.clearCookie('accessToken');
  }
}
