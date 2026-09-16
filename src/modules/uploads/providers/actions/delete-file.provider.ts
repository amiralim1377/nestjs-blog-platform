// src/modules/uploads/providers/actions/delete-file.provider.ts
import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { STORAGE_SERVICE } from '../../constants/upload.constants.js';
import type { StorageService } from '../../interfaces/storage-service.interface.js';
import { Upload } from '../../entities/upload.entity.js';
import type { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class DeleteFileProvider {
  private readonly logger = new Logger(DeleteFileProvider.name);

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,
  ) {}

  public async execute(
    id: string,
    user: ActiveUserData,
  ): Promise<{ message: string; id: string }> {
    const upload = await this.uploadsRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!upload) {
      throw new NotFoundException(`Upload record with ID ${id} not found.`);
    }

    const isOwner = upload.user?.id === user.sub;
    if (!isOwner) {
      throw new ForbiddenException(
        'You are not authorized to delete this file.',
      );
    }

    const isDeletedFromStorage = await this.storageService.deleteFile(
      upload.path,
    );
    if (!isDeletedFromStorage) {
      this.logger.warn(
        `Failed to remove file from storage at "${upload.path}". Continuing DB record cleanup.`,
      );
    }

    try {
      await this.uploadsRepository.remove(upload);
      return {
        message: 'File and metadata deleted successfully.',
        id,
      };
    } catch (error: any) {
      this.logger.error(
        { err: error, id },
        'Failed to remove upload record from database.',
      );
      throw new InternalServerErrorException(
        'Failed to complete file deletion.',
        { cause: error },
      );
    }
  }
}
