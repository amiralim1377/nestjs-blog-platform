import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import { HashingProvider } from '../hashing/hashing.provider.js';
import { GenerateTokensProvider } from '../tokens/generate-tokens.provider.js';
import { AuthCreateUserDto } from '../../dto/createUser.dto.js';
import type { UsersService as UsersServiceType } from '../../../users/providers/users.service.js';

@Injectable()
export class RegisterProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersServiceType,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  async register(createUserDto: AuthCreateUserDto) {
    let existingUser;

    try {
      // Check if user with email exists
      existingUser = await this.usersService.findByEmail(createUserDto.email);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        { description: 'Error connecting to database' },
      );
    }

    if (existingUser) {
      throw new BadRequestException(
        'The user already exists, please check your email',
      );
    }

    let newUser;
    try {
      // FIX: Added 'await' to the create method
      newUser = await this.usersService.create({
        ...createUserDto,
        password: await this.hashingProvider.hashPassword(
          createUserDto.password,
        ),
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        { description: 'Error connecting to database' },
      );
    }

    // Now 'newUser' is properly resolved before passing to generateTokens
    const tokens = await this.generateTokensProvider.generateTokens(newUser);

    return {
      user: newUser,
      ...tokens,
    };
  }
}
