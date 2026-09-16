import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller.js';
import { UploadsService } from './providers/uploads.service.js';
import { Upload } from './entities/upload.entity.js';
import { SupabaseStorageService } from './storage/supabase-storage.service.js';
import { LocalStorageService } from './storage/local-storage.service.js';
import { STORAGE_SERVICE } from './constants/upload.constants.js';

@Module({
  imports: [TypeOrmModule.forFeature([Upload])],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    SupabaseStorageService,
    LocalStorageService,
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
