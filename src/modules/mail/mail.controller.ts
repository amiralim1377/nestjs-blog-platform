import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MailService } from './providers/mail.service.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import { Auth } from '../auth/decorator/auth.decorator.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator.js';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test-welcome')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send test welcome mail (Admin only).' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully.' })
  public async testWelcomeMail(
    @Body('email') email: string,
    @Body('name') name: string,
  ) {
    await this.mailService.sendWelcomeMail(email, name);
    return { message: 'Welcome email sent successfully!' };
  }

  @Post('test-reset-password')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send test reset password mail (Admin only).' })
  @ApiResponse({
    status: 200,
    description: 'Reset password email sent successfully.',
  })
  public async testResetPasswordMail(
    @Body('email') email: string,
    @Body('name') name: string,
  ) {
    const dummyToken = 'test-token-12345';
    const clientUrl =
      process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000';
    const resetLink = `${clientUrl}/reset-password?token=${dummyToken}`;

    await this.mailService.sendResetPasswordMail({
      to: email,
      name: name,
      resetLink: resetLink,
    });
    return { message: 'Reset password email sent successfully!' };
  }
}
