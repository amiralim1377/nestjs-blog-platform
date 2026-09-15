import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import { Redis } from 'ioredis';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto.js';
import * as crypto from 'crypto';
import { RedisKeys } from '../../../redis/redis.keys.js';
import { MailService } from '../../../mail/providers/mail.service.js';

@Injectable()
export class ForgotPasswordProvider {
  constructor(
    private readonly usersService: UsersService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly mailService: MailService,
  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const redisKey = RedisKeys.resetPasswordToken(resetToken);

    await this.redisClient.set(redisKey, user.id, 'EX', 900);

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    this.mailService.sendResetPasswordMail(
      user.email,
      resetLink,
      user.firstName,
    );

    return {
      message: 'Password reset link has been sent to your email.',
    };
  }
}
