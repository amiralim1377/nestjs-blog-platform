import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class RemoveUserProvider {
  private readonly logger = new Logger(RemoveUserProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async removeUser(userId: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.softRemove(user);

    this.logger.log(`User ${userId} soft removed successfully`);

    return {
      message: `User with id ${userId} was deleted`,
    };
  }
}
