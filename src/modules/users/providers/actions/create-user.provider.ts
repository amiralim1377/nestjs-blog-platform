import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity.js';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dto/create-user.dto.js';
import { HashingProvider } from '../../../auth/providers/hashing/hashing.provider.js';

@Injectable()
export class CreateUserProvider {
  private readonly logger = new Logger(CreateUserProvider.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      this.logger.warn(
        `Registration rejected. User already exists: ${createUserDto.email}`,
      );

      throw new ConflictException(
        'The user already exists, please check your email',
      );
    }

    // Ensure password is always securely hashed before storage
    let passwordToStore = createUserDto.password;
    if (passwordToStore && !passwordToStore.startsWith('$argon2')) {
      passwordToStore =
        await this.hashingProvider.hashPassword(passwordToStore);
    }

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: passwordToStore,
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);

      this.logger.log(
        {
          userId: savedUser.id,
          email: savedUser.email,
          action: 'USER_CREATED',
        },
        'User registered successfully',
      );

      return savedUser;
    } catch (error: any) {
      if (error?.code === '23505' || error?.message?.includes('UNIQUE')) {
        throw new ConflictException(
          'The user already exists, please check your email',
        );
      }
      throw new InternalServerErrorException('Could not create user account');
    }
  }
}
