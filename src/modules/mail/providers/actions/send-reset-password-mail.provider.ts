import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordTemplateContext } from '../../interfaces/mail-template.interface.js';
import { SendResetPasswordDto } from '../../dto/send-reset-password.dto.js';

@Injectable()
export class SendResetPasswordMailProvider {
  private readonly logger = new Logger(SendResetPasswordMailProvider.name);
  constructor(private readonly mailerService: MailerService) {}

  public async sendMail(
    sendResetPasswordDto: SendResetPasswordDto,
  ): Promise<boolean> {
    const { to, name, resetLink } = sendResetPasswordDto;

    try {
      await this.mailerService.sendMail({
        to: to,
        subject: 'Reset Your Password - Action Required',
        template: './reset-password',
        context: {
          name: name,
          resetLink: resetLink,
        } as ResetPasswordTemplateContext,
      });
      this.logger.log(`Reset password email successfully sent to ${to}`);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
