import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { PostStatus } from '../../enums/post-status.enum.js';

@Injectable()
export class FindPostBySlugProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  public async findPostBySlug(slug: string) {
    const post = await this.postRepository.findOne({
      where: {
        slug,
        status: PostStatus.PUBLISHED,
      },
      relations: {
        author: true,
        categories: true,
        tags: true,
      },
      select: {
        author: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`There is no post with slug: ${slug}`);
    }

    return post;
  }
}
