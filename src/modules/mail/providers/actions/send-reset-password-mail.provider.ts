import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordTemplateContext } from '../../interfaces/mail-template.interface.js';
import { SendResetPasswordDto } from '../../dto/send-reset-password.dto.js';
import { ForgotPasswordEvent } from '../../../auth/events/forgot-passwprd.event.js';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SendResetPasswordMailProvider {
  private readonly logger = new Logger(SendResetPasswordMailProvider.name);
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent(ForgotPasswordEvent.EVENT_NAME, { async: true })
  public async sendMail(event: ForgotPasswordEvent): Promise<boolean> {
    const { email: to, firstName: name, resetLink } = event;

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
      const stack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to send reset password email to ${to}`, stack);
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
