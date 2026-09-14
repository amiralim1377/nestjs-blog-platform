import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class FindPostByIdProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async findPostById(postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: {
        author: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`There is no post with id: ${postId}`);
    }

    return post;
  }
}
