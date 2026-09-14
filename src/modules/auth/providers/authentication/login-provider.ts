import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import type { UsersService as UsersServiceType } from '../../../users/providers/users.service.js';
import { LoginDto } from '../../dto/login.dto.js';
import { HashingProvider } from '../hashing/hashing.provider.js';
import { GenerateTokensProvider } from '../tokens/generate-tokens.provider.js';
import { Redis } from 'ioredis';
import { RedisKeys } from '../../../redis/redis.keys.js';

@Injectable()
export class LoginProvider {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_SECONDS = 1 * 20;
  private readonly logger = new Logger(LoginProvider.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersServiceType,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  public async login(loginDto: LoginDto) {
    // lockout = blocking the user account
    // lockoutKey = the Redis key for the user's lockout
    let lockoutKey: string | null = null;
    // failedAttempts stores the number of failed login attempts.
    let failedAttempts: string | null = null;

    console.log('loginDto', loginDto);

    // 1. Check the account lockout status
    try {
      lockoutKey = RedisKeys.getAccountLockoutKey(loginDto.email);
      failedAttempts = await this.redisClient.get(lockoutKey);
    } catch (error) {
      this.logger.error(
        `Redis Error (GET) for email: ${loginDto.email}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to check account lockout status.',
      );
    }

    console.log('failedAttempts', failedAttempts);

    if (
      failedAttempts &&
      parseInt(failedAttempts, 10) >= this.MAX_FAILED_ATTEMPTS
    ) {
      throw new UnauthorizedException(
        'Your account has been temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.',
      );
    }

    // 2. Retrieve the user from the database
    const user = await this.usersService.findByEmail(loginDto.email);

    console.log('RAW PASSWORD:', loginDto.password);
    console.log('HASHED PASSWORD:', user?.password);
    console.log('user', user);

    // 3. Validate the password if the user and password exist
    let isPasswordValid: boolean = false;
    if (user && user.password) {
      try {
        isPasswordValid = await this.hashingProvider.comparePassword(
          loginDto.password,
          user.password,
        );
      } catch (error) {
        this.logger.error(
          `Password compare error for: ${loginDto.email}`,
          error,
        );
        throw new InternalServerErrorException(error, {
          description: 'Could not compare password',
        });
      }
    }

    console.log('isPasswordValid', isPasswordValid);

    // 4. Handle failed login attempts
    // Covers invalid email, incorrect password, and accounts without a password
    if (!user || !user.password || !isPasswordValid) {
      try {
        const currentAttempts = await this.redisClient.incr(lockoutKey);

        if (
          currentAttempts === 1 ||
          currentAttempts >= this.MAX_FAILED_ATTEMPTS
        ) {
          await this.redisClient.expire(
            lockoutKey,
            this.LOCKOUT_DURATION_SECONDS,
          );
        }
      } catch (error) {
        this.logger.error(
          `Redis Error (INCR) for account lockout: ${loginDto.email}`,
          error,
        );
      }

      // Return a specific message for users who registered with Google
      if (user && !user.password) {
        throw new UnauthorizedException(
          'Please sign in using your Google account',
        );
      }

      // Return a generic error message for invalid credentials
      throw new UnauthorizedException('email or password is wrong');
    }

    // 5. Clear failed login attempts after a successful login
    // Do not fail the login request if Redis is temporarily unavailable

    try {
      await this.redisClient.del(lockoutKey);
    } catch (error) {
      this.logger.error(
        `Redis Error (DEL) failed to clear lockout for: ${loginDto.email}`,
        error,
      );
      // Do not throw an error because the login was successful
      // // and the tokens should still be issued
    }

    // Generate access and refresh tokens
    const tokens = await this.generateTokensProvider.generateTokens(user);

    return tokens;
  }
}
