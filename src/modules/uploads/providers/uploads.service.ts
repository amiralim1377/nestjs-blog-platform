import { Injectable } from '@nestjs/common';
import { UploadFileProvider } from './actions/upload-file.provider.js';
import { DeleteFileProvider } from './actions/delete-file.provider.js';
import type { ActiveUserData } from '../../auth/interfaces/active-user-data.interface.js';
import { Upload } from '../entities/upload.entity.js';

@Injectable()
export class UploadsService {
  constructor(
    private readonly uploadFileProvider: UploadFileProvider,
    private readonly deleteFileProvider: DeleteFileProvider,
  ) {}

  public async uploadFile(
    file: Express.Multer.File,
    user: ActiveUserData,
    folder?: string,
  ): Promise<Upload> {
    return this.uploadFileProvider.execute(file, user, folder);
  }

  public async deleteFile(
    id: string,
    user: ActiveUserData,
  ): Promise<{ message: string; id: string }> {
    return this.deleteFileProvider.execute(id, user);
  }
}
