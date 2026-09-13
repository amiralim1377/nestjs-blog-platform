import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ActiveUser } from '../auth/decorator/active-user.decorator.js';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface.js';
import { Auth } from '../auth/decorator/auth.decorator.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Auth(AuthType.Bearer)
  create(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.create(createPostDto, user);
  }

  @Patch()
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Updates an existing blog post in the database.' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  public updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.update(updatePostDto, user);
  }

  @Delete(':id')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Deletes an existing blog post.' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  public deletePost(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.delete(id, user);
  }
}
