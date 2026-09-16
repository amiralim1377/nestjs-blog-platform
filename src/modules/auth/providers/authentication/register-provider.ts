import {
  ConflictException,
  forwardRef,
  GatewayTimeoutException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import { HashingProvider } from '../hashing/hashing.provider.js';
import { GenerateTokensProvider } from '../tokens/generate-tokens.provider.js';
import { AuthCreateUserDto } from '../../dto/create-user.dto.js';
import type { UsersService as UsersServiceType } from '../../../users/providers/users.service.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RegisterProvider {
  private readonly logger = new Logger(RegisterProvider.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersServiceType,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
    @InjectQueue('mail-queue') private readonly mailQueue: Queue,
  ) {}

  async register(createUserDto: AuthCreateUserDto) {
    let existingUser;

    try {
      // Check if user with email exists
      existingUser = await this.usersService.existsByEmail(createUserDto.email);
    } catch (error) {
      this.logger.error(
        {
          err: error,
          email: createUserDto.email,
          action: 'RegisterProvider',
        },
        'Database error while checking email',
      );

      throw new GatewayTimeoutException(
        'Unable to process your request at the moment please try later',
        { description: 'Error connecting to database' },
      );
    }

    if (existingUser) {
      throw new ConflictException(
        'The user already exists, please check your email.',
      );
    }

    let newUser;
    try {
      const hashedPassword = await this.hashingProvider.hashPassword(
        createUserDto.password,
      );

      newUser = await this.usersService.create({
        ...createUserDto,
        password: hashedPassword,
      });
    } catch (error) {
      this.logger.error(
        `Error creating new user: ${createUserDto.email}`,
        error,
      );

      const dbError = error as { code?: string };

      if (dbError.code === '23505' || dbError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'The user already exists, please check your email.',
        );
      }

      throw new InternalServerErrorException('Unable to create user account.');
    }

    // Now 'newUser' is properly resolved before passing to generateTokens
    const tokens = await this.generateTokensProvider.generateTokens(newUser);

    // this.eventEmitter.emit(
    //   UserCreatedEvent.EVENT_NAME,
    //   new UserCreatedEvent(newUser.email, newUser.firstName),
    // );

    await this.mailQueue.add(
      'send-welcome',
      {
        email: newUser.email,
        firstName: newUser.firstName,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    );

    return {
      user: newUser,
      ...tokens,
    };
  }
}
