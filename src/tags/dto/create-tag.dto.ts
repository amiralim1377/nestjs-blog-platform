import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    example: 'Artificial Intelligence',
    description: 'The name of the tag',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @ApiProperty({
    example: 'artificial-intelligence',
    description:
      'URL-friendly slug (lowercase, no spaces, only hyphens allowed)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Slug should only contain lowercase letters, numbers, and hyphens (no spaces)',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Posts related to AI and Machine Learning',
    description: 'A short description of the tag for SEO',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
