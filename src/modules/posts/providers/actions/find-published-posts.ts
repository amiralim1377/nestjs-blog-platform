import { Injectable } from '@nestjs/common';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetPostsDto } from '../../dto/get-posts.dto.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';
import { PostStatus } from '../../enums/post-status.enum.js';

@Injectable()
export class FindPublishedPostProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  async findPublishedPosts(postQuery: GetPostsDto, currentUrl: string) {
    const whereConditions: any = {
      status: PostStatus.PUBLISHED,
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
