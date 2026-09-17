import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm'; // 👈 Added ILike for search
import { Post } from '../../entities/post.entity.js';
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

    // 1. Filter by Status
    if (postQuery.status) {
      whereConditions.status = postQuery.status;
    }

    // 2. Search in Post Title (Case-insensitive)
    if (postQuery.search) {
      whereConditions.title = ILike(`%${postQuery.search}%`);
    }

    // 3. Filter by Author
    if (postQuery.authorId) {
      whereConditions.author = { id: postQuery.authorId };
    }

    // 4. Filter by Category
    if (postQuery.categoryId) {
      whereConditions.categories = { id: postQuery.categoryId };
    }

    // 5. Filter by Tag
    if (postQuery.tagId) {
      whereConditions.tags = { id: postQuery.tagId };
    }

    return await this.paginationProvider.paginateQuery(
      postQuery,
      this.postRepository,
      currentUrl,
      {
        where: whereConditions,
        order: { publishOn: 'DESC' }, // Sort from newest to oldest
        relations: {
          author: true,
          categories: true, // Needed for UI post cards
          tags: true, // Needed for UI post cards
        },
        select: {
          author: {
            id: true,
            firstName: true,
            lastName: true,
          },
          // Note: In list views, we usually omit the full 'content' field
          // to keep the payload size small, but we'll keep it simple for now.
        },
      },
    );
  }
}
