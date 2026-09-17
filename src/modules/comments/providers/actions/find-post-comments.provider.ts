import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from '../../entities/comment.entity.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';
import { GetPostsDto } from '../../../posts/dto/get-posts.dto.js';

@Injectable()
export class FindPostCommentsProvider {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async findByPostId(
    postId: number,
    postQuery: GetPostsDto,
    currentUrl: string,
  ) {
    return await this.paginationProvider.paginateQuery(
      postQuery,
      this.commentRepository,
      currentUrl,
      {
        where: {
          post: { id: postId },
          parent: IsNull(),
        },
        relations: {
          author: true,
        },
        select: {
          author: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      },
    );
  }
}
