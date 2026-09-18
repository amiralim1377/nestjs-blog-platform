import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity.js';
import { UpdateCommentDto } from '../../dto/update-comment.dto.js';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class UpdateCommentProvider {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  public async update(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    user: ActiveUserData,
  ) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: { author: true },
    });

    if (!comment) {
      throw new NotFoundException('The requested comment was not found.');
    }

    if (String(comment.author.id) !== String(user.sub)) {
      throw new ForbiddenException('You can only edit your own comments.');
    }
    comment.content = updateCommentDto.content ?? comment.content;

    return await this.commentRepository.save(comment);
  }
}
