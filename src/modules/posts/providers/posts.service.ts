import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto.js';
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface.js';
import { CreatePostProvider } from './actions/create-post.provider.js';
import { UpdatePostDto } from '../dto/update-post.dto.js';
import { UpdatePostProvider } from './actions/update-post.provider.js';
import { DeletePostProvider } from './actions/delete-post.provider.js';
import { FindAllPostsProvider } from './actions/find-all-post.provider.js';
import { GetPostsDto } from '../dto/get-posts.dto.js';
import { FindPostBySlugProvider } from './actions/find-post-by-slug.js';
import { FindPostByIdProvider } from './actions/find-by-id.provider.js';
import { FindPublishedPostProvider } from './actions/find-published-posts.js';
import { RestoreDeletedPostProvider } from './actions/restore-deleted-post.js';
import { FindMyDraftPostsProvider } from './actions/find-my-draft-posts.provider.js';
import { FindDraftPostsProvider } from './actions/find-draft-posts.js';

@Injectable()
export class PostsService {
  constructor(
    private readonly createPostProvider: CreatePostProvider,
    private readonly UpdatePostProvider: UpdatePostProvider,
    private readonly deletePostProvider: DeletePostProvider,
    private readonly findAllPostsProvider: FindAllPostsProvider,
    private readonly findPostBySlugProvider: FindPostBySlugProvider,
    private readonly findPostByIdProvider: FindPostByIdProvider,
    private readonly findPublishedPostProvider: FindPublishedPostProvider,
    private readonly restoreDeletedPostProvider: RestoreDeletedPostProvider,
    private readonly findDraftPostsProvider: FindDraftPostsProvider,
    private readonly findMyDraftPostsProvider: FindMyDraftPostsProvider,
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

  async findBySlug(slug: string) {
    return await this.findPostBySlugProvider.findPostBySlug(slug);
  }

  async findById(postId: number) {
    return await this.findPostByIdProvider.findPostById(postId);
  }

  async findPublishedPosts(postQuery: GetPostsDto, currentUrl: string) {
    return await this.findPublishedPostProvider.findPublishedPosts(
      postQuery,
      currentUrl,
    );
  }

  async restoreDeletedPost(postId: number, user: ActiveUserData) {
    return await this.restoreDeletedPostProvider.restoreDeletedPost(
      postId,
      user,
    );
  }

  async findDraftPosts(postQuery: GetPostsDto, currentUrl: string) {
    return await this.findDraftPostsProvider.findDraftPosts(
      postQuery,
      currentUrl,
    );
  }
  async findMyDraftPosts(
    postQuery: GetPostsDto,
    currentUrl: string,
    user: ActiveUserData,
  ) {
    return await this.findMyDraftPostsProvider.findMyDraftPosts(
      postQuery,
      currentUrl,
      user,
    );
  }

  async findMyPosts(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }

  async publish(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }

  async unpublish(postId: number, user: ActiveUserData) {
    return await this.deletePostProvider.delete(postId, user);
  }
}
