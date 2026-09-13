import { Module } from '@nestjs/common';
import { PostsService } from './providers/posts.service.js';
import { PostsController } from './posts.controller.js';
import { UsersModule } from '../users/users.module.js';
import { CreatePostProvider } from './providers/actions/create-post.provider.js';
import { UpdatePostProvider } from './providers/actions/update-post.provider.js';
import { DeletePostProvider } from './providers/actions/delete-post.provider.js';

@Module({
  imports: [UsersModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    CreatePostProvider,
    UpdatePostProvider,
    DeletePostProvider,
  ],
  exports: [],
})
export class PostsModule {}
