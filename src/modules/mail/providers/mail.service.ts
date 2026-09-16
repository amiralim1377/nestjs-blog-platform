import { Injectable } from '@nestjs/common';
import { SendResetPasswordMailProvider } from './actions/send-reset-password-mail.provider.js';
import { SendResetPasswordDto } from '../dto/send-reset-password.dto.js';

@Injectable()
export class MailService {
  constructor(
    private readonly sendResetPasswordMailProvider: SendResetPasswordMailProvider,
  ) {}

  public async sendResetPasswordMail(
    sendResetPasswordDto: SendResetPasswordDto,
  ) {
    this.sendResetPasswordMailProvider.sendMail(sendResetPasswordDto);
  }
}
