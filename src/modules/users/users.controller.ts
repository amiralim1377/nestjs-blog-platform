import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Delete,
  ServiceUnavailableException,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService } from './providers/users.service.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import { Auth } from '../auth/decorator/auth.decorator.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUsersDto } from './dto/get-users.dto.js';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Retrieves a paginated list of users.' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  public async findAll(
    @Query() getUsersDto: GetUsersDto,
    @Req() request: Request,
  ) {
    return this.usersService.findAllUser(
      getUsersDto,
      `${request.protocol}://${request.get('host')}${request.originalUrl}`,
    );
  }

  @Patch(':userId')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Updates the authenticated user information.' })
  @ApiResponse({
    status: 200,
    description: 'User information updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user information.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({ summary: 'Removes a user account.' })
  @ApiResponse({
    status: 204,
    description: 'User removed successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  public async remove(@Param('userId') userId: string) {
    return this.usersService.remove(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Creates a new user account.' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'The user already exists or invalid user information.',
  })
  public async create(@Body() createUserDto: CreateUserDto) {
    throw new ServiceUnavailableException(
      'User registration is temporarily disabled',
    );
    return this.usersService.create(createUserDto);
  }
}
