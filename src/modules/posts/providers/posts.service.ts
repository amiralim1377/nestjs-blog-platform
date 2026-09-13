import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity.js';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/providers/users.service.js';
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface.js';
import { CreatePostProvider } from './actions/create-post.provider.js';
import { UpdatePostDto } from '../dto/update-post.dto.js';
import { UpdatePostProvider } from './actions/update-post.provider.js';
import { DeletePostProvider } from './actions/delete-post.provider.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private usersService: UsersService,
    private readonly createPostProvider: CreatePostProvider,
    private readonly UpdatePostProvider: UpdatePostProvider,
    private readonly deletePostProvider: DeletePostProvider,
  ) {}

  async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    return await this.createPostProvider.create(createPostDto, user);
  }

  async update(updatePostDto: UpdatePostDto, user: ActiveUserData) {
    return await this.UpdatePostProvider.update(updatePostDto, user);
  }

  async delete(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }

  async findAll(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }

  async findBySlug(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }

  async findMyPosts(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }

  async changePostStatus(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }
  async restore(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }
}
