import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller.js';
import { UploadsService } from './providers/uploads.service.js';
import { Upload } from './entities/upload.entity.js';
import { STORAGE_SERVICE } from './constants/upload.constants.js';
import { DeleteFileProvider } from './providers/actions/delete-file.provider.js';
import { SupabaseStorageService } from './providers/storage/supabase-storage.service.js';
import { LocalStorageService } from './providers/storage/local-storage.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Upload])],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    SupabaseStorageService,
    LocalStorageService,
    DeleteFileProvider,
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService, SupabaseStorageService, LocalStorageService],
      useFactory: (
        configService: ConfigService,
        supabase: SupabaseStorageService,
        local: LocalStorageService,
      ) => {
        const driver = configService.get<string>('upload.driver');
        return driver === 'local' ? local : supabase;
      },
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
