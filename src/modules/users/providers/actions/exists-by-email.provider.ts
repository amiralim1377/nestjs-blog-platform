import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class ExistsByEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async existsByEmail(email: string): Promise<boolean> {
    return this.usersRepository.exists({
      where: {
        email,
      },
    });
  }
}
