import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService } from './providers/users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
