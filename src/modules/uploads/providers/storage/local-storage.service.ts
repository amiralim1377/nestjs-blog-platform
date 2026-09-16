import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { StorageService } from '../../interfaces/storage-service.interface.js';
import { StorageProviders } from '../../enums/storage-providers.enum.js';
import { FileMetadata } from '../../interfaces/file-metadata.interface.js';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadsRoot: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appUrl =
      this.configService.get<string>('appConfig.appUrl') ||
      'http://localhost:3000';

    this.uploadsRoot = path.resolve(
      process.cwd(),
      this.configService.get<string>('upload.localDestination') || 'uploads',
    );
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
        this.configService.get<string>('upload.localDestination') || 'uploads',
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
        { err: error, fileName: file.originalname },
        'Local file upload failed',
      );

      throw new InternalServerErrorException(
        'Failed to save file to local storage.',
        { cause: error },
      );
    }
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullSystemPath = path.resolve(process.cwd(), filePath);

      if (!fullSystemPath.startsWith(this.uploadsRoot)) {
        this.logger.warn(
          { filePath },
          'SECURITY ALERT: Attempted path traversal detected!',
        );
        return false;
      }

      await fs.unlink(fullSystemPath);
      return true;
    } catch (error: any) {
      this.logger.error(
        { err: error, filePath },
        'Failed to delete local file',
      );
      return false;
    }
  }
}
