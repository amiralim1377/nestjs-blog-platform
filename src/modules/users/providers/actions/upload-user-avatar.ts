import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UploadsService } from '../../../uploads/providers/uploads.service.js';
import { User } from '../../entities/user.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';
import { UPLOAD_FOLDERS } from '../../../uploads/constants/upload.constants.js';

@Injectable()
export class UploadAvatarProvider {
  private readonly logger = new Logger(UploadAvatarProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly uploadsService: UploadsService,
  ) {}

  public async uploadAvatar(
    file: Express.Multer.File,
    activeUser: ActiveUserData,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id: activeUser.sub },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarId) {
      try {
        await this.uploadsService.deleteFile(user.avatarId, activeUser);
      } catch (error) {
        this.logger.warn(
          `Could not delete old avatar (ID: ${user.avatarId}) for user ${user.id}. Skipping...`,
        );
      }
    }

    const uploadRecord = await this.uploadsService.uploadFile(
      file,
      activeUser,
      UPLOAD_FOLDERS.AVATARS,
    );

    user.avatar = uploadRecord.url;
    user.avatarId = uploadRecord.id;

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      this.logger.error(
        { err: error, userId: user.id },
        'Database connection failed while saving user avatar. Initiating rollback...',
      );

      try {
        await this.uploadsService.deleteFile(uploadRecord.id, activeUser);
      } catch (rollbackError) {
        this.logger.error(
          { err: rollbackError, uploadId: uploadRecord.id },
          'CRITICAL: Failed to rollback orphaned avatar file after user save failed!',
        );
      }

      throw new InternalServerErrorException(
        'Failed to update profile due to an internal system error. Please try again later.',
      );
    }

    return {
      message: 'Avatar updated successfully',
      avatarUrl: uploadRecord.url,
    };
  }
}
