import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.provider.js';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination.query.dto.js';

@Injectable()
export class GetAllCommentsProvider {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async getAllPostComments(
    paginationQuery: PaginationQueryDto,
    currentUrl: string,
  ) {
    return await this.paginationProvider.paginateQuery(
      paginationQuery,
      this.commentRepository,
      currentUrl,
      {
        order: {
          createdAt: 'DESC',
        },
        relations: {
          author: true,
        },
      },
    );
  }
}
