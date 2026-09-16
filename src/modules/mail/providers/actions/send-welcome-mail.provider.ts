import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../../users/events/user-created.event.js';

@Injectable()
export class SendWelcomeMailProvider {
  private readonly logger = new Logger(SendWelcomeMailProvider.name);

  constructor(private readonly mailerService: MailerService) {}

  @OnEvent(UserCreatedEvent.name, { async: true })
  public async sendMail(event: UserCreatedEvent): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: event.email,
        subject: 'Welcome to Our Application! 🎉',
        template: './welcome',
        context: {
          name: event.firstName,
        },
      });
      this.logger.log(`Welcome email successfully sent to ${event.email}`);
      return true;
    } catch (error) {
      const stack = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `Failed to send welcome email to ${event.email}`,
        stack,
      );
      throw new InternalServerErrorException('Error sending welcome email');
    }
  }
}
