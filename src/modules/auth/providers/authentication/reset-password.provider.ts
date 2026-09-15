import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import { HashingProvider } from '../hashing/hashing.provider.js';
import { Redis } from 'ioredis';
import { ResetPasswordDto } from '../../dto/reset-password.dto.js';
import { RedisKeys } from '../../../redis/redis.keys.js';

@Injectable()
export class ResetPasswordProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingProvider: HashingProvider,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const redisKey = RedisKeys.resetPasswordToken(resetPasswordDto.token);

    const userId = await this.redisClient.get(redisKey);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedNewPassword = await this.hashingProvider.hashPassword(
      resetPasswordDto.newPassword,
    );

    await this.usersService.updatePasswordInDatabase(userId, hashedNewPassword);

    // Invalidate the used reset token
    await this.redisClient.del(redisKey);

    // Invalidate active session families for this user to prevent ongoing compromised sessions
    await this.redisClient.set(
      RedisKeys.revokeTokenFamily(userId),
      'true',
      'EX',
      7 * 24 * 60 * 60,
    );

    return {
      message: 'Password has been successfully reset. You can now login.',
    };
  }
}
