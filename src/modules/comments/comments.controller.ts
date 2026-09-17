import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { CommentsService } from './providers/comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { Auth } from '../auth/decorator/auth.decorator.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActiveUser } from '../auth/decorator/active-user.decorator.js';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface.js';
import { GetPostsDto } from '../posts/dto/get-posts.dto.js';
import type { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new comment or reply to an existing one' })
  @ApiResponse({
    status: 201,
    description: 'Comment successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error).',
  })
  @ApiResponse({
    status: 404,
    description: 'Post, Parent Comment, or Targeted User not found.',
  })
  public async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.commentsService.createComment(createCommentDto, user);
  }

  @Get('post/:postId')
  @Auth(AuthType.None)
  @ApiOperation({
    summary: 'Get paginated top-level comments for a specific post',
  })
  public async getPostComments(
    @Param('postId') postId: number,
    @Query() queryDto: GetPostsDto,
    @Req() request: Request,
  ) {
    const currentUrl = `${request.protocol}://${request.get('host')}${request.path}`;
    return this.commentsService.findPostComments(postId, queryDto, currentUrl);
  }

  @Get(':commentId/replies')
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Get paginated replies for a specific comment' })
  public async getCommentReplies(
    @Param('commentId') commentId: number,
    @Query() queryDto: GetPostsDto,
    @Req() request: Request,
  ) {
    const currentUrl = `${request.protocol}://${request.get('host')}${request.path}`;
    return this.commentsService.findCommentReplies(
      commentId,
      queryDto,
      currentUrl,
    );
  }
}
