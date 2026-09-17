import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity.js';
import { CreateCommentDto } from '../../dto/create-comment.dto.js';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

import { UsersService } from '../../../users/providers/users.service.js';
import { PostsService } from '../../../posts/providers/posts.service.js';

@Injectable()
export class CreateCommentProvider {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  public async create(
    createCommentDto: CreateCommentDto,
    user: ActiveUserData,
  ) {
    const { postId, parentId, replyToUserId, content } = createCommentDto;

    // 1. Validate Author (Using 'as any' to bypass strict string/number type mismatch)
    const author = await this.usersService.findById(user.sub as any);
    if (!author) {
      throw new NotFoundException('The author was not found.');
    }

    // 2. Validate Post Existence
    const post = await this.postsService.findById(postId);
    if (!post) {
      throw new NotFoundException('The requested post was not found.');
    }

    let finalParentId = parentId;

    // 3. 🔴 The Magic: Instagram-Style Flattening Logic (Max Depth = 1)
    if (parentId) {
      const targetParentComment = await this.commentRepository.findOne({
        where: { id: parentId },
        relations: { parent: true }, // 👈 حل خطای اول: تغییر ساختار Array به Object
      });

      if (!targetParentComment) {
        throw new NotFoundException('The parent comment was not found.');
      }

      if (targetParentComment.parent) {
        finalParentId = targetParentComment.parent.id;
      }
    }

    // 4. Validate Targeted User
    let replyToUser = null;
    if (replyToUserId) {
      replyToUser = await this.usersService.findById(replyToUserId as any);
      if (!replyToUser) {
        throw new NotFoundException(
          'The user you are trying to reply to was not found.',
        );
      }
    }

    // 5. Create the Comment Entity
    const newComment = this.commentRepository.create({
      content,
      post: { id: postId },
      author,
      ...(finalParentId && { parent: { id: finalParentId } }),
      ...(replyToUser && { replyToUser }),
    });

    // 6. Save and Return
    return await this.commentRepository.save(newComment);
  }
}
