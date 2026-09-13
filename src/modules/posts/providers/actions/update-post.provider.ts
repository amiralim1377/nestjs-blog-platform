import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { UsersService } from '../../../users/providers/users.service.js';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';
import { UpdatePostDto } from '../../dto/update-post.dto.js';

@Injectable()
export class UpdatePostProvider {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async update(updatePostDto: UpdatePostDto, user: ActiveUserData) {
    let post = undefined;

    try {
      post = await this.postRepository.findOne({
        where: { id: updatePostDto.id },
        relations: {
          author: true,
        },
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to database',
        },
      );
    }

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (String(post.author.id) !== String(user.sub)) {
      throw new ForbiddenException('you are not allowed to updated this post');
    }

    // Update properties
    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;
    post.status = updatePostDto.status ?? post.status;
    post.postType = updatePostDto.postType ?? post.postType;
    post.slug = updatePostDto.slug ?? post.slug;

    try {
      // Save and return
      return await this.postRepository.save(post);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to database',
        },
      );
    }
  }
}
