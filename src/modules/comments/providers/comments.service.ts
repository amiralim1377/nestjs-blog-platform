import { Injectable } from '@nestjs/common';
import { CreateCommentProvider } from './actions/create-comment.provider.js';
import { CreateCommentDto } from '../dto/create-comment.dto.js';
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class CommentsService {
  constructor(private readonly createCommentProvider: CreateCommentProvider) {}

  public async createComment(
    createCommentDto: CreateCommentDto,
    user: ActiveUserData,
  ) {
    return await this.createCommentProvider.create(createCommentDto, user);
  }
}
