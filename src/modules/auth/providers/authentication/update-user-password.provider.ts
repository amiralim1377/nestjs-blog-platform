import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserPasswordDto } from '../../dto/update-user-password.dto.js';
import { UsersService } from '../../../users/providers/users.service.js';
import { HashingProvider } from '../hashing/hashing.provider.js';
import { GenerateTokensProvider } from '../tokens/generate-tokens.provider.js';
import type { UsersService as UsersServiceType } from '../../../users/providers/users.service.js';
import { ActiveUserData } from '../../interfaces/active-user-data.interface.js';

@Injectable()
export class UpdateUserPasswordProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersServiceType,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  async updateUserPassword(
    userId: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
    user: ActiveUserData,
  ) {
    if (user.sub !== userId) {
      throw new ForbiddenException('You can only update your own password');
    }

    const currentUser = await this.usersService.findById(userId);

    if (!currentUser) {
      throw new NotFoundException('user not found');
    }

    if (!currentUser.password) {
      throw new BadRequestException(
        'User does not have a password set. (Perhaps registered via OAuth)',
      );
    }

    let isPasswordMatch;

    try {
      isPasswordMatch = await this.hashingProvider.comparePassword(
        updateUserPasswordDto.oldPassword,
        currentUser.password,
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }

    if (!isPasswordMatch) {
      throw new BadRequestException('Incorrect current password');
    }

    const hashedNewPassword = await this.hashingProvider.hashPassword(
      updateUserPasswordDto.newPassword,
    );

    await this.usersService.updatePasswordInDatabase(userId, hashedNewPassword);

    const tokens =
      await this.generateTokensProvider.generateTokens(currentUser);

    return {
      message: 'Password updated successfully',
      ...tokens,
    };
  }
}
