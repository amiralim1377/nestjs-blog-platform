import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import { Redis } from 'ioredis';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto.js';
import * as crypto from 'crypto';
import { RedisKeys } from '../../../redis/redis.keys.js';
import { MailService } from '../../../mail/providers/mail.service.js';

@Injectable()
export class ForgotPasswordProvider {
  private readonly logger = new Logger(ForgotPasswordProvider.name);

  constructor(
    private readonly usersService: UsersService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly mailService: MailService,
  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const redisKey = RedisKeys.resetPasswordToken(resetToken);

      await this.redisClient.set(redisKey, user.id, 'EX', 900);

      const clientUrl =
        process.env.CLIENT_URL ||
        process.env.APP_URL ||
        'http://localhost:3000';
      const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

      try {
        await this.mailService.sendResetPasswordMail({
          to: user.email,
          name: user.firstName,
          resetLink: resetLink,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send reset password email to: ${user.email}`,
          error,
        );
      }
    }

    return {
      message:
        'If that email address is in our database, we will send you an email to reset your password.',
    };
  }
}
