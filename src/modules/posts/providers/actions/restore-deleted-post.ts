import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class RestoreDeletedPostProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async restoreDeletedPost(postId: number, user: ActiveUserData) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      withDeleted: true,
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
    if (post.author.id !== user.sub) {
      throw new ForbiddenException('You are not allowed to restore this post');
    }

    if (!post.deletedAt) {
      throw new BadRequestException(`Post with id ${postId} is not deleted`);
    }

    await this.postRepository.restore(postId);

    return {
      message: 'Post restored successfully',
      postId,
    };
  }
}
