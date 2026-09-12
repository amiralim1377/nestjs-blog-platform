import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import type { UsersService as UsersServiceType } from '../../../users/providers/users.service.js';
import { LoginDto } from '../../dto/login.dto.js';
import { HashingProvider } from '../hashing/hashing.provider.js';
import { GenerateTokensProvider } from '../tokens/generate-tokens.provider.js';

@Injectable()
export class LoginProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersServiceType,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async login(loginDto: LoginDto) {
    let user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('email or password is wrong');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Please sign in using your Google account',
      );
    }

    let isPasswordValid: boolean = false;
    try {
      isPasswordValid = await this.hashingProvider.comparePassword(
        loginDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare password',
      });
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('email or password is wrong');
    }

    return await this.generateTokensProvider.generateTokens(user);
  }
}
