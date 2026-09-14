import { Injectable } from '@nestjs/common';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostStatus } from '../../enums/post-status.enum.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';
import { GetPostsDto } from '../../dto/get-posts.dto.js';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class FindMyDraftPostsProvider {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  async findMyDraftPosts(
    postQuery: GetPostsDto,
    currentUrl: string,
    user: ActiveUserData,
  ) {
    const whereConditions = {
      status: PostStatus.DRAFT,
      author: {
        id: user.sub,
      },
    };

    return await this.paginationProvider.paginateQuery(
      postQuery,
      this.postRepository,
      currentUrl,
      {
        where: whereConditions,
        order: { createdAt: 'DESC' },
        relations: { author: true },
      },
    );
  }
}
