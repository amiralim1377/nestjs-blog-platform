import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  UPLOAD_FOLDERS,
  type UploadFolder,
} from '../constants/upload.constants.js';

export class CreateUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Binary file payload (JPG, PNG, WEBP images up to 3MB)',
  })
  file: any;

  @ApiPropertyOptional({
    description: 'Target destination folder in storage bucket',
    enum: Object.values(UPLOAD_FOLDERS),
    default: UPLOAD_FOLDERS.POSTS,
    example: UPLOAD_FOLDERS.POSTS,
  })
  @IsOptional()
  @IsEnum(UPLOAD_FOLDERS, {
    message: 'Invalid folder. Allowed options: avatars, posts, general',
  })
  folder?: UploadFolder;

  @ApiPropertyOptional({
    description: 'Image alternative text for SEO and accessibility',
    example: 'NestJS Clean Architecture blog post cover image',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;
}
