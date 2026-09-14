import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity.js';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dto/create-user.dto.js';

@Injectable()
export class CreateUserProvider {
  private readonly logger = new Logger(CreateUserProvider.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
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
      this.logger.warn(
        `Registration rejected. User already exists: ${createUserDto.email}`,
      );

      throw new BadRequestException(
        'The user already exists, please check your email',
      );
    }

    const newUser = this.usersRepository.create({
      ...createUserDto,
    });

    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.logger.error(`Failed to save user: ${createUserDto.email}`, error);

      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to database',
        },
      );
    }
  }
}
