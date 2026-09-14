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
import { PostStatus } from '../../enums/post-status.enum.js';

@Injectable()
export class UnPublishPostProvider {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async unpublishPost(postId: number, user: ActiveUserData) {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
      relations: {
        author: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`There is no post with id: ${postId}`);
    }

    if (post.author.id !== user.sub) {
      throw new ForbiddenException(
        'You are not allowed to unpublish this post',
      );
    }

    if (post.status !== PostStatus.PUBLISHED) {
      throw new BadRequestException('This post is not published');
    }

    post.status = PostStatus.DRAFT;
    post.publishOn = null;

    return await this.postRepository.save(post);
  }
}
