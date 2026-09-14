import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';
import { GetPostsDto } from '../../dto/get-posts.dto.js';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class FindMyPostProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  async findMyPost(
    postQuery: GetPostsDto,
    currentUrl: string,
    user: ActiveUserData,
  ) {
    const whereConditions: any = {
      author: { id: user.sub },
    };

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
