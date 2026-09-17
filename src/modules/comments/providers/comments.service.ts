import { Injectable } from '@nestjs/common';
import { CreateCommentProvider } from './actions/create-comment.provider.js';
import { CreateCommentDto } from '../dto/create-comment.dto.js';
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface.js';
import { FindPostCommentsProvider } from './actions/find-post-comments.provider.js';
import { FindCommentRepliesProvider } from './actions/find-comment-replies.provider.js';
import { GetPostsDto } from '../../posts/dto/get-posts.dto.js';

@Injectable()
export class CommentsService {
  constructor(
    private readonly createCommentProvider: CreateCommentProvider,
    private readonly findPostCommentsProvider: FindPostCommentsProvider,
    private readonly findCommentRepliesProvider: FindCommentRepliesProvider,
  ) {}

  public async createComment(
    createCommentDto: CreateCommentDto,
    user: ActiveUserData,
  ) {
    return await this.createCommentProvider.create(createCommentDto, user);
  }

  public async findPostComments(
    postId: number,
    queryDto: GetPostsDto,
    currentUrl: string,
  ) {
    return await this.findPostCommentsProvider.findByPostId(
      postId,
      queryDto,
      currentUrl,
    );
  }

  public async findCommentReplies(
    commentId: number,
    queryDto: GetPostsDto,
    currentUrl: string,
  ) {
    return await this.findCommentRepliesProvider.findReplies(
      commentId,
      queryDto,
      currentUrl,
    );
  }
}
