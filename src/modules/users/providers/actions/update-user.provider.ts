import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateUserDto } from '../../dto/update-user.dto.js';
import { User } from '../../entities/user.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UpdateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async updateUserInfo(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    if (updateUserDto.password) {
      throw new BadRequestException('This route is not for updating password');
    }

    const user = await this.usersRepository.preload({
      id: userId,
      ...updateUserDto,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      return await this.usersRepository.save(user);
    } catch (error: any) {
      if (error?.code === '23505' || error?.message?.includes('UNIQUE')) {
        throw new ConflictException('A user with this email already exists');
      }
      throw new InternalServerErrorException('Error updating user information');
    }
  }
}
