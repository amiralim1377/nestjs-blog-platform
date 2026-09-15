import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MailService } from './providers/mail.service.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import { Auth } from '../auth/decorator/auth.decorator.js';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test-welcome')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async testWelcomeMail(
    @Body('email') email: string,
    @Body('name') name: string,
  ) {
    await this.mailService.sendWelcomeMail(email, name);
    return { message: 'Welcome email sent successfully to Mailtrap!' };
  }

  @Post('test-reset-password')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async testResetPasswordMail(
    @Body('email') email: string,
    @Body('name') name: string,
  ) {
    const dummyToken = 'test-token-12345';
    const resetLink = `http://localhost:3000/reset-password?token=${dummyToken}`;

    await this.mailService.sendResetPasswordMail({
      to: email,
      name: name,
      resetLink: resetLink,
    });
    return { message: 'Reset password email sent successfully to Mailtrap!' };
  }
}
