import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity.js';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class DeleteCommentProvider {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  public async delete(commentId: number, user: ActiveUserData) {
    // 1. Find the comment and its author
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: { author: true },
    });

    // 2. Throw error if comment doesn't exist
    if (!comment) {
      throw new NotFoundException('The requested comment was not found.');
    }

    // 3. Authorization Check: Ensure the user requesting deletion is the actual author
    // Note: If you have an Admin role in ActiveUserData, you can allow admins to bypass this check
    if (comment.author.id !== user.sub) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment.',
      );
    }

    // 4. Perform Soft Delete (populates 'deletedAt' column instead of hard removing the row)
    await this.commentRepository.softRemove(comment);

    // 5. Return a success response
    return {
      deleted: true,
      id: commentId,
      message: 'Comment was successfully deleted.',
    };
  }
}
