import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity.js';
import { Repository } from 'typeorm';
import { HashingProvider } from '../../auth/providers/hashing/hashing.provider.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  async create(createUserDto: CreateUserDto) {
    let existingUser = undefined;

    try {
      // Check if user with email exists
      existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to database',
        },
      );
    }

    if (existingUser) {
      throw new BadRequestException(
        'The user already exists, please check your email',
      );
    }

    let newUser = this.usersRepository.create({
      ...createUserDto,
      password: await this.hashingProvider.hashPassword(createUserDto.password),
    });

    try {
      newUser = await this.usersRepository.save(newUser);
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to database',
        },
      );
    }

    // Create the user
    return newUser;
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
