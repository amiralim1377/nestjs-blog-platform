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
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { PostType } from '../enums/post-type.enum.js';
import { PostStatus } from '../enums/post-status.enum.js';
import { Type } from 'class-transformer';
import { JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  title: string;

  @IsEnum(PostType)
  @IsNotEmpty()
  postType: PostType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'اسلاگ (Slug) باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد (بدون فاصله). مثال: my-first-post',
  })
  slug: string;

  @IsString()
  @IsOptional()
  content?: string;

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

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  publishOn?: Date;

  @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

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
