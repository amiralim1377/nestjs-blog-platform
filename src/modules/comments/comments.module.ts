import { Module } from '@nestjs/common';
import { CommentsService } from './providers/comments.service.js';
import { CommentsController } from './comments.controller.js';
import { PostsModule } from '../posts/posts.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity.js';
import { CreateCommentProvider } from './providers/actions/create-comment.provider.js';
import { UsersModule } from '../users/users.module.js';
import { FindPostCommentsProvider } from './providers/actions/find-post-comments.provider.js';
import { FindCommentRepliesProvider } from './providers/actions/find-comment-replies.provider.js';
import { DeleteCommentProvider } from './providers/actions/delete-comment.provider.js';
import { PaginationModule } from '../../common/pagination/pagination.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    PaginationModule,
    PostsModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CreateCommentProvider,
    FindPostCommentsProvider,
    FindCommentRepliesProvider,
    DeleteCommentProvider,
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
