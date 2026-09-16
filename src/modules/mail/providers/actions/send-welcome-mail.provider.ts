import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class SendWelcomeMailProvider {
  private readonly logger = new Logger(SendWelcomeMailProvider.name);

  constructor(private readonly mailerService: MailerService) {}

  public async sendMail(email: string, userName: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Our Application! 🎉',
        template: './welcome',
        context: {
          name: userName,
        },
      });
      this.logger.log(`Welcome email successfully sent to ${email}`);
      return true;
    } catch (error) {
      const stack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to send welcome email to ${email}`, stack);
      throw new InternalServerErrorException('Error sending welcome email');
    }
  }
}
