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

    existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

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

    const savedUser = await this.usersRepository.save(newUser);

    this.logger.log(
      { userId: savedUser.id, email: savedUser.email, action: 'USER_CREATED' },
      'User registered successfully',
    );

    return savedUser;
  }
}
