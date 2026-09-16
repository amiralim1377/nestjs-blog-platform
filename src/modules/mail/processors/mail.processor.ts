import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SendWelcomeMailProvider } from '../providers/actions/send-welcome-mail.provider.js';
import { SendResetPasswordMailProvider } from '../providers/actions/send-reset-password-mail.provider.js';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly sendWelcomeMail: SendWelcomeMailProvider,
    private readonly sendResetPasswordMail: SendResetPasswordMailProvider,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case 'send-welcome':
          await this.sendWelcomeMail.sendMail(
            job.data.email,
            job.data.firstName,
          );
          break;

        case 'send-reset-password':
          await this.sendResetPasswordMail.sendMail(job.data);
          break;

        default:
          this.logger.warn(`No handler for job name: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}`, error);
      throw error;
    }
  }
}
