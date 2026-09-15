import { Injectable } from '@nestjs/common';
import { SendResetPasswordMailProvider } from './actions/send-reset-password-mail.provider.js';

@Injectable()
export class MailService {
  constructor(
    private readonly sendResetPasswordMailProvider: SendResetPasswordMailProvider,
  ) {}

  public async sendResetPasswordMail(
    email: string,
    resetLink: string,
    userName: string,
  ) {
    this.sendResetPasswordMailProvider.sendMail(email, resetLink, userName);
  }
}
