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
import { PaginationQueryDto } from '../../../common/pagination/dto/pagination.query.dto.js';
import { FindAllPostsProvider } from './actions/find-all-post.provider.js';
import { GetPostsDto } from '../dto/get-posts.dto.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private usersService: UsersService,
    private readonly createPostProvider: CreatePostProvider,
    private readonly UpdatePostProvider: UpdatePostProvider,
    private readonly deletePostProvider: DeletePostProvider,
    private readonly findAllPostsProvider: FindAllPostsProvider,
  ) {}

  async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    return await this.createPostProvider.create(createPostDto, user);
  }

  async update(
    postId: number,
    updatePostDto: UpdatePostDto,
    user: ActiveUserData,
  ) {
    return await this.UpdatePostProvider.update(postId, updatePostDto, user);
  }

  async delete(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }

  public async findAll(postQuery: GetPostsDto, currentUrl: string) {
    return await this.findAllPostsProvider.findAll(postQuery, currentUrl);
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
