import { Module } from '@nestjs/common';
import { CommentsService } from './providers/comments.service.js';
import { CommentsController } from './comments.controller.js';
import { PostsModule } from '../posts/posts.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity.js';
import { CreateCommentProvider } from './providers/actions/create-comment.provider.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PostsModule, UsersModule],
  controllers: [CommentsController],
  providers: [CommentsService, CreateCommentProvider],
  exports: [CommentsService],
})
export class CommentsModule {}
