import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';
import { GetPostsDto } from '../../../posts/dto/get-posts.dto.js';

/**
 * Provider responsible for fetching paginated replies for a specific comment.
 */
@Injectable()
export class FindCommentRepliesProvider {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  /**
   * Finds and paginates replies for a given parent comment ID.
   *
   * @param commentId - The ID of the parent comment
   * @param queryDto - Pagination query parameters (page, limit, etc.)
   * @param currentUrl - The current request URL used for generating pagination links
   * @returns A paginated result containing the replies
   */
  public async findReplies(
    commentId: number,
    queryDto: GetPostsDto,
    currentUrl: string,
  ) {
    return await this.paginationProvider.paginateQuery(
      queryDto,
      this.commentRepository,
      currentUrl,
      {
        where: {
          // Fetch only comments that are direct replies to the specified parent comment
          parent: { id: commentId },
        },
        relations: {
          // Load the author of the reply and the specific user being replied to
          author: true,
          replyToUser: true,
        },
        select: {
          // Select only essential user information to prevent sensitive data leaks
          author: {
            id: true,
            firstName: true,
            lastName: true,
          },
          replyToUser: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        order: {
          // Sort replies chronologically (oldest first) to maintain thread readability
          createdAt: 'ASC',
        },
      },
    );
  }
}
