import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '../../dto/create-post.dto.js';
import { UsersService } from '../../../users/providers/users.service.js';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class CreatePostProvider {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    let author;

    // Find the user who is creating the post
    try {
      author = await this.usersService.findById(user.sub);
    } catch (error) {
      throw new ConflictException(error);
    }

    if (!author) {
      throw new NotFoundException('The requested author was not found.');
    }

    // Create a new post entity with the authenticated user as the author
    const newPost = this.postRepository.create({
      ...createPostDto,
      author,
    });

    // Save the post and handle duplicate or database constraint errors
    return await this.postRepository.save(newPost);
  }
}
