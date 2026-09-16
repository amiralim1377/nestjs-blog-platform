import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { StorageService } from '../interfaces/storage-service.interface.js';
import type { FileMetadata } from '../interfaces/file-metadata.interface.js';
import { StorageProviders } from '../enums/storage-providers.enum.js';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadsRoot = path.resolve(process.cwd(), 'uploads');
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appUrl =
      this.configService.get<string>('appConfig.appUrl') ||
      'http://localhost:3000';
  }

  public async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<FileMetadata> {
    try {
      const targetFolder = path.join(this.uploadsRoot, folder);

      await fs.mkdir(targetFolder, { recursive: true });

      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${randomUUID()}${fileExtension}`;
      const destinationPath = path.join(targetFolder, uniqueFileName);

      await fs.writeFile(destinationPath, file.buffer);

      const relativeStoragePath = path.posix.join(
        'uploads',
        folder,
        uniqueFileName,
      );
      const publicUrl = `${this.appUrl.replace(/\/$/, '')}/${relativeStoragePath}`;

      return {
        url: publicUrl,
        path: relativeStoragePath,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        provider: StorageProviders.LOCAL,
      };
    } catch (error: any) {
      this.logger.error(
        `Local file upload failed: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to save file to local storage.',
      );
    }
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullSystemPath = path.resolve(process.cwd(), filePath);
      await fs.unlink(fullSystemPath);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to delete local file at "${filePath}": ${error.message}`,
      );
      return false;
    }
  }
}
