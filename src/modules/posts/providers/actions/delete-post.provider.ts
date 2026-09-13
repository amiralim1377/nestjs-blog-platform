import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class DeletePostProvider {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async delete(postId: number, user: ActiveUserData) {
    // Find the post along with its author
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: {
        author: true,
      },
    });

    // Check if the post exists
    if (!post) {
      throw new NotFoundException('The requested post was not found.');
    }

    // Ensure that only the post author can delete it
    if (String(post.author.id) !== String(user.sub)) {
      throw new ForbiddenException('You are not allowed to delete this post.');
    }

    try {
      // Perform a soft delete instead of permanently removing the record
      // The deletedAt column will be populated while the record remains in the database
      await this.postRepository.softDelete(postId);

      return {
        message: 'The post was successfully deleted.',
        deletedId: postId,
      };
    } catch (error) {
      throw new RequestTimeoutException(
        'Failed to delete the post. Please try again later.',
      );
    }
  }
}
