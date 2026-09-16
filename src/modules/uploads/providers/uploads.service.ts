import { Inject, Injectable } from '@nestjs/common';
import { Upload } from '../entities/upload.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { StorageService } from '../interfaces/storage-service.interface.js';
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface.js';
import { STORAGE_SERVICE } from '../constants/upload.constants.js';

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
    const { path, url } = await this.storageService.uploadFile(file, folder);

    const uploadRecord = this.uploadsRepository.create({
      url,
      path,
      mimeType: file.mimetype,
      size: file.size,
      user: { id: user.sub } as any,
    });

    return await this.uploadsRepository.save(uploadRecord);
  }
}
