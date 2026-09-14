import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class FindPostBySlugProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  public async findPostBySlug(slug: string) {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: {
        author: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`There is no post with slug: ${slug}`);
    }

    return post;
  }
}
