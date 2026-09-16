import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../entities/upload.entity.js';
import { STORAGE_SERVICE } from '../constants/upload.constants.js';
import type { StorageService } from '../interfaces/storage-service.interface.js';
import type { ActiveUserData } from '../../auth/interfaces/active-user-data.interface.js';
import { User } from '../../users/entities/user.entity.js';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,
  ) {}

  public async uploadFile(
    file: Express.Multer.File,
    user: ActiveUserData,
    folder: string = 'posts',
  ) {
    const metadata = await this.storageService.uploadFile(file, folder);

    const uploadRecord = this.uploadsRepository.create({
      ...metadata,
      user: { id: user.sub } as User,
    });

    return await this.uploadsRepository.save(uploadRecord);
  }
}
