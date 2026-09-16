import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { STORAGE_SERVICE } from '../../constants/upload.constants.js';
import type { StorageService } from '../../interfaces/storage-service.interface.js';
import { Upload } from '../../entities/upload.entity.js';
import { User } from '../../../users/entities/user.entity.js';
import type { ActiveUserData } from '../../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class UploadFileProvider {
  private readonly logger = new Logger(UploadFileProvider.name);

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,
  ) {}

  public async execute(
    file: Express.Multer.File,
    user: ActiveUserData,
    folder: string = 'posts',
  ): Promise<Upload> {
    const metadata = await this.storageService.uploadFile(file, folder);

    try {
      const uploadRecord = this.uploadsRepository.create({
        url: metadata.url,
        path: metadata.path,
        mimeType: metadata.mimeType,
        size: metadata.size,
        provider: metadata.provider,
        user: { id: user.sub } as User,
      });

      return await this.uploadsRepository.save(uploadRecord);
    } catch (error: any) {
      this.logger.error(
        { err: error, path: metadata.path },
        'Failed to save upload record in database. Rolling back storage file.',
      );

      await this.storageService.deleteFile(metadata.path);

      throw new InternalServerErrorException(
        'Failed to persist upload metadata.',
        { cause: error },
      );
    }
  }
}
