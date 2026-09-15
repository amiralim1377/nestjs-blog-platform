import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SendResetPasswordMailProvider {
  private readonly logger = new Logger(SendResetPasswordMailProvider.name);
  constructor(private readonly mailerService: MailerService) {}

  public async sendMail(
    email: string,
    resetLink: string,
    userName: string,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password - Action Required',
        template: './reset-password',
        context: {
          name: userName,
          resetLink: resetLink,
        },
      });
      this.logger.log(`Reset password email successfully sent to ${email}`);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
