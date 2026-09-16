import { Inject, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import { Redis } from 'ioredis';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto.js';
import * as crypto from 'crypto';
import { RedisKeys } from '../../../redis/redis.keys.js';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class ForgotPasswordProvider {
  private readonly logger = new Logger(ForgotPasswordProvider.name);

  constructor(
    private readonly usersService: UsersService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @InjectQueue('mail-queue') private readonly mailQueue: Queue,
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
        // this.eventEmitter.emit(
        //   ForgotPasswordEvent.EVENT_NAME,
        //   new ForgotPasswordEvent(user.email, user.firstName, resetLink),
        // );

        await this.mailQueue.add(
          'send-reset-password',
          {
            email: user.email,
            firstName: user.firstName,
            resetLink,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
            removeOnComplete: true,
          },
        );
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
