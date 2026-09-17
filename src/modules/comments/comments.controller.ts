import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './providers/comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { Auth } from '../auth/decorator/auth.decorator.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActiveUser } from '../auth/decorator/active-user.decorator.js';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Auth(AuthType.Bearer)
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
}
