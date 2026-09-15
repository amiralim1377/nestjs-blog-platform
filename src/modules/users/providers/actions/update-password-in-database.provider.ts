import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity.js';

@Injectable()
export class UpdatePasswordInDatabaseProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async updatePasswordInDataBase(userId: string, hashedNewPassword: string) {
    await this.usersRepository.update(userId, {
      password: hashedNewPassword,
    });
  }
}
