import { Injectable } from '@nestjs/common';
import { SendResetPasswordMailProvider } from './actions/send-reset-password-mail.provider.js';
import { SendWelcomeMailProvider } from './actions/send-welcome-mail.provider.js';

@Injectable()
export class MailService {
  constructor(
    private readonly sendResetPasswordMailProvider: SendResetPasswordMailProvider,
    private readonly sendWelcomeMailProvider: SendWelcomeMailProvider,
  ) {}

  public async sendResetPasswordMail(
    email: string,
    resetLink: string,
    userName: string,
  ) {
    this.sendResetPasswordMailProvider.sendMail(email, resetLink, userName);
  }

  public async sendWelcomeMail(email: string, userName: string) {
    this.sendWelcomeMailProvider.sendMail(email, userName).catch(() => {});
  }
}
