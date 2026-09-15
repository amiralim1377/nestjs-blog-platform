import { BadRequestException, Injectable } from '@nestjs/common';
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
    console.log('DTO:', updateUserDto);
    console.log('PASSWORD:', updateUserDto.password);

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

    return this.usersRepository.save(user);
  }
}
