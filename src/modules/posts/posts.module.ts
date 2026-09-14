import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './providers/posts.service.js';
import { PostsController } from './posts.controller.js';
import { UsersModule } from '../users/users.module.js';
import { Post } from './entities/post.entity.js';
import { CreatePostProvider } from './providers/actions/create-post.provider.js';
import { UpdatePostProvider } from './providers/actions/update-post.provider.js';
import { DeletePostProvider } from './providers/actions/delete-post.provider.js';
import { PaginationModule } from '../../common/pagination/pagination.module.js';
import { FindAllPostsProvider } from './providers/actions/find-all-post.provider.js';
import { FindPostBySlugProvider } from './providers/actions/find-post-by-slug.js';
import { FindPostByIdProvider } from './providers/actions/find-by-id.provider.js';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Post]), PaginationModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    CreatePostProvider,
    UpdatePostProvider,
    DeletePostProvider,
    FindAllPostsProvider,
    FindPostBySlugProvider,
    FindPostByIdProvider,
  ],
  exports: [],
})
export class PostsModule {}
