import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PostType } from '../enums/post-type.enum.js';
import { PostStatus } from '../enums/post-status.enum.js';

export class CreatePostDto {
  @ApiProperty({
    example: 'مقدمه‌ای بر NestJS',
    description: 'The title of the post',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  title: string;

  @ApiProperty({
    enum: PostType,
    description: 'Type of the post (e.g., article, video)',
  })
  @IsEnum(PostType)
  @IsNotEmpty()
  postType: PostType;

  @ApiProperty({ example: 'my-first-post', description: 'URL-friendly slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'اسلاگ (Slug) باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد (بدون فاصله). مثال: my-first-post',
  })
  slug: string;

  @ApiPropertyOptional({ description: 'HTML or Markdown content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Optional JSON schema for dynamic data' })
  @IsJSON()
  @IsOptional()
  schema?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Future publish date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  publishOn?: Date;

  @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of existing Category IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  categoryIds: number[];

  @ApiPropertyOptional({
    example: ['nestjs', 'typescript', 'backend'],
    description: 'Array of tag names',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
