import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleRef } from '@nestjs/core';
import { UploadsController } from './uploads.controller.js';
import { UploadsService } from './providers/uploads.service.js';
import { Upload } from './entities/upload.entity.js';
import { SupabaseStorageService } from './providers/storage/supabase-storage.service.js';
import { LocalStorageService } from './providers/storage/local-storage.service.js';
import { UploadFileProvider } from './providers/actions/upload-file.provider.js';
import { DeleteFileProvider } from './providers/actions/delete-file.provider.js';
import { STORAGE_SERVICE } from './constants/upload.constants.js';

@Module({
  imports: [TypeOrmModule.forFeature([Upload])],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    UploadFileProvider,
    DeleteFileProvider,
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService, ModuleRef],
      useFactory: async (
        configService: ConfigService,
        moduleRef: ModuleRef,
      ) => {
        const driver = configService.get<string>('upload.driver');
        if (driver === 'local') {
          return await moduleRef.create(LocalStorageService);
        }
        return await moduleRef.create(SupabaseStorageService);
      },
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
