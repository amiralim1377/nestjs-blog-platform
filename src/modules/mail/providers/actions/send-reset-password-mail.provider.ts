import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordTemplateContext } from '../../interfaces/mail-template.interface.js';

@Injectable()
export class SendResetPasswordMailProvider {
  private readonly logger = new Logger(SendResetPasswordMailProvider.name);

  constructor(private readonly mailerService: MailerService) {}

  public async sendMail(data: {
    email: string;
    firstName: string;
    resetLink: string;
  }): Promise<boolean> {
    const { email: to, firstName: name, resetLink } = data;

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

      throw new Error(`Error sending reset password email to ${to}`);
    }
  }
}
