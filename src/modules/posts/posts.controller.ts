import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ActiveUser } from '../auth/decorator/active-user.decorator.js';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface.js';
import { Auth } from '../auth/decorator/auth.decorator.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { GetPostsDto } from './dto/get-posts.dto.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  create(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.create(createPostDto, user);
  }

  @Patch(':id')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Updates an existing blog post in the database.' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  public updatePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.update(postId, updatePostDto, user);
  }

  @Delete(':id')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({ summary: 'Deletes an existing blog post.' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  public deletePost(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.delete(id, user);
  }

  @Get()
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Returns all posts with pagination and filters.' })
  @ApiResponse({
    status: 200,
    description: 'Posts were successfully retrieved.',
  })
  public getAllPosts(@Query() postQuery: GetPostsDto, @Req() request: Request) {
    const currentUrl = `${request.protocol}://${request.headers.host}${request.path}`;

    return this.postsService.findAll(postQuery, currentUrl);
  }

  @Get(':id')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Gets a single blog post by its numeric ID.' })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
  })
  public getPostById(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.findById(postId);
  }

  @Get('slug/:slug')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Retrieves a single blog post by its slug.' })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
  })
  public getPostBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }
}
