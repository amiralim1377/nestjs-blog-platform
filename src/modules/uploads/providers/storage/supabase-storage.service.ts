import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../supabase/supabase.provider.js';
import { StorageProviders } from '../../enums/storage-providers.enum.js';
import { StorageService } from '../../interfaces/storage-service.interface.js';
import type { FileMetadata } from '../../interfaces/file-metadata.interface.js';

@Injectable()
export class SupabaseStorageService implements StorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly bucket: string;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly configService: ConfigService,
  ) {
    this.bucket =
      this.configService.get<string>('upload.supabaseBucket') || 'blog-assets';
  }

  public async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<FileMetadata> {
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${folder}/${randomUUID()}${fileExtension}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(
        { err: error, fileName: file.originalname },
        'Supabase upload failed',
      );
      throw new InternalServerErrorException(
        'Failed to upload file to storage.',
        { cause: error },
      );
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      provider: StorageProviders.SUPABASE,
    };
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([filePath]);

    if (error) {
      this.logger.error(
        { err: error, path: filePath },
        'Failed to delete file from Supabase',
      );
      return false;
    }
    return true;
  }
}
