import { Injectable } from '@nestjs/common';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostStatus } from '../../enums/post-status.enum.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';
import { GetPostsDto } from '../../dto/get-posts.dto.js';

@Injectable()
export class FindDraftPostsProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  async findDraftPosts(postQuery: GetPostsDto, currentUrl: string) {
    const whereConditions: any = {
      status: PostStatus.DRAFT,
    };

    return await this.paginationProvider.paginateQuery(
      postQuery,
      this.postRepository,
      currentUrl,
      {
        where: whereConditions,
        order: { publishOn: 'DESC' },
        relations: { author: true },
      },
    );
  }
}
