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
import { UpdatePostDto } from '../../dto/update-post.dto.js';
import { GenerateSlugProvider } from './generate-slug.provider.js';

@Injectable()
export class UpdatePostProvider {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly generateSlugProvider: GenerateSlugProvider,
  ) {}

  /**
   * Updates an existing post, ensuring user authorization and applying smart slug regeneration.
   */
  async update(
    postId: number,
    updatePostDto: UpdatePostDto,
    user: ActiveUserData,
  ) {
    let post = undefined;

    try {
      post = await this.postRepository.findOne({
        where: { id: postId },
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

    // Authorization check: Ensure the requesting user is the author of the post
    if (String(post.author.id) !== String(user.sub)) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    // Update basic properties if they are provided in the payload
    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;
    post.status = updatePostDto.status ?? post.status;
    post.postType = updatePostDto.postType ?? post.postType;

    // 👇 Smart Slug Update Logic
    // Proceed only if the user has provided a new title or a specific slug in the request
    if (updatePostDto.title || updatePostDto.slug) {
      const baseTarget = updatePostDto.slug || updatePostDto.title;

      if (baseTarget) {
        // Normalize the new title/slug to standard slug format
        const normalizedNewSlug = this.generateSlugProvider.slugify(baseTarget);

        // Generate a new unique slug ONLY if the normalized slug differs from the current one.
        // This prevents unnecessary suffix increments (e.g., 'my-post' becoming 'my-post-1')
        // when the title remains effectively unchanged.
        if (normalizedNewSlug !== post.slug) {
          post.slug =
            await this.generateSlugProvider.generateUniqueSlug(baseTarget);
        }
      }
    }

    try {
      // Save the updated entity and return the result
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
