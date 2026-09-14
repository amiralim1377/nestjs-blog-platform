import { Injectable } from '@nestjs/common';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetPostsDto } from '../../dto/get-posts.dto.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';

@Injectable()
export class FindAllPostsProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly paginationProvider: PaginationProvider,
  ) {}
  public async findAll(postQuery: GetPostsDto, currentUrl: string) {
    const whereConditions: any = {};

    if (postQuery.status) {
      whereConditions.status = postQuery.status;
    }

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
