import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller.js';
import { UploadsService } from './providers/uploads.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './entities/upload.entity.js';
import { SupabaseStorageService } from './storage/supabase-storage.service.js';
import { STORAGE_SERVICE } from './constants/upload.constants.js';

@Module({
  imports: [TypeOrmModule.forFeature([Upload])],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    SupabaseStorageService,
    {
      provide: STORAGE_SERVICE,
      useClass: SupabaseStorageService,
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
