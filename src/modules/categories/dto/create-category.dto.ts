import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Back-end', description: 'The name of the category' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @ApiProperty({
    example: 'back-end',
    description: 'URL-friendly slug (lowercase, no spaces)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug should only contain lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'All about server-side programming',
    description: 'A short description for SEO',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The ID of the parent category (if this is a sub-category)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;
}
