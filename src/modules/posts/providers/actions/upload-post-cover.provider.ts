import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Post } from '../../entities/post.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadsService } from '../../../uploads/providers/uploads.service.js';
import type { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';
import { UPLOAD_FOLDERS } from '../../../uploads/constants/upload.constants.js';

@Injectable()
export class UploadPostCoverProvider {
  private readonly logger = new Logger(UploadPostCoverProvider.name);

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly uploadsService: UploadsService,
  ) {}

  async uploadPostCover(
    postId: number,
    file: Express.Multer.File,
    activeUser: ActiveUserData,
  ) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    if (post.author && post.author.id !== activeUser.sub) {
      throw new ForbiddenException(
        'You are not authorized to update the cover of this post',
      );
    }

    if (post.coverImageId) {
      try {
        await this.uploadsService.deleteFile(post.coverImageId, activeUser);
      } catch (error) {
        this.logger.warn(
          `Could not delete old post cover (ID: ${post.coverImageId}) for post ${post.id}. Skipping...`,
        );
      }
    }

    const uploadRecord = await this.uploadsService.uploadFile(
      file,
      activeUser,
      UPLOAD_FOLDERS.COVERS,
    );

    post.coverImage = uploadRecord.url;
    post.coverImageId = uploadRecord.id;

    try {
      await this.postRepository.save(post);
    } catch (error) {
      this.logger.error(
        { err: error, postId: post.id },
        'Database connection failed while saving post cover. Initiating rollback...',
      );

      try {
        await this.uploadsService.deleteFile(uploadRecord.id, activeUser);
      } catch (rollbackError) {
        this.logger.error(
          { err: rollbackError, uploadId: uploadRecord.id },
          'CRITICAL: Failed to rollback orphaned post cover file after post save failed!',
        );
      }

      throw new InternalServerErrorException(
        'Failed to update post cover due to an internal system error. Please try again later.',
      );
    }

    return {
      message: 'Post cover updated successfully',
      coverImageUrl: uploadRecord.url,
      coverImageId: uploadRecord.id,
    };
  }

  public async deletePostCover(postId: number, activeUser: ActiveUserData) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    if (post.author && post.author.id !== activeUser.sub) {
      throw new ForbiddenException(
        'You are not authorized to delete the cover of this post',
      );
    }

    if (!post.coverImageId) {
      throw new BadRequestException('This post does not have a cover image');
    }

    const previousCoverId = post.coverImageId;

    await this.uploadsService.deleteFile(previousCoverId, activeUser);

    post.coverImage = null as any;
    post.coverImageId = null as any;

    await this.postRepository.save(post);

    return {
      message: 'Post cover deleted successfully',
      postId: post.id,
    };
  }
}
