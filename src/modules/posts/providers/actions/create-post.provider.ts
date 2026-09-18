import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto } from '../../dto/create-post.dto.js';
import { Post } from '../../entities/post.entity.js';
import { UsersService } from '../../../users/providers/users.service.js';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';
import { CategoriesService } from '../../../categories/providers/categories.service.js';
import { TagsService } from '../../../tags/providers/tags.service.js';
import { Tag } from '../../../tags/entities/tag.entity.js';
import { GenerateSlugProvider } from './generate-slug.provider.js';

@Injectable()
export class CreatePostProvider {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
    private readonly generateSlugProvider: GenerateSlugProvider,
  ) {}

  async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    // 1. Extract fields that require special processing from the rest of the DTO
    const { categoryIds, tags, schema, slug, ...restDto } = createPostDto;

    // 2. Validate and find the author creating the post
    let author;
    try {
      author = await this.usersService.findById(user.sub);
    } catch (error) {
      throw new NotFoundException(error);
    }

    if (!author) {
      throw new NotFoundException('The requested author was not found.');
    }

    // 3. Parse the schema from a string to an object (fixes the TypeScript type error)
    const parsedSchema = schema ? JSON.parse(schema) : undefined;

    // 4. Fetch valid categories using the provided IDs
    const categories =
      await this.categoriesService.findMultipleCategories(categoryIds);

    // 5. Check and create new tags (Find-or-Create pattern)
    let postTags: Tag[] = [];
    if (tags && tags.length > 0) {
      postTags = await this.tagsService.findOrCreateMultiple(tags);
    }

    const baseSlugStr = slug || restDto.title;
    const uniqueSlug =
      await this.generateSlugProvider.generateUniqueSlug(baseSlugStr);

    // 6. Create a new post entity with standard data and correct relations
    const newPost = this.postRepository.create({
      ...restDto,
      schema: parsedSchema, // Assign the parsed object instead of a string
      author, // Assign the author entity
      categories, // Assign the category entities (Many-to-Many relation)
      tags: postTags, // Assign the tag entities (Many-to-Many relation)
      slug: uniqueSlug,
    });

    // 7. Save to the database and handle potential duplicate slug errors
    try {
      return await this.postRepository.save(newPost);
    } catch (error: any) {
      throw new InternalServerErrorException(
        'An error occurred while creating the post.',
        error.message,
      );
    }
  }
}
