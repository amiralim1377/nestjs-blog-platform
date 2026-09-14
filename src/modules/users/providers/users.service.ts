import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity.js';
import { Repository } from 'typeorm';
import { CreateUserProvider } from './actions/create-user.provider.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly createUserProvider: CreateUserProvider,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.createUserProvider.create(createUserDto);
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email },
    });

    return user;
  }

  /**
   * Find a single user using the ID of the user
   */
  async findById(id: string) {
    let user = undefined;
    try {
      user = await this.usersRepository.findOneBy({
        id,
      });
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to database',
        },
      );
    }

    if (!user) {
      throw new BadRequestException('The user id does not exist');
    }

    return user;
  }
}
