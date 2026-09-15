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

    await this.redisClient.del(redisKey);

    return {
      message: 'Password has been successfully reset. You can now login.',
    };
  }
}
