import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({ description: 'متن کامنت', example: 'مقاله بسیار مفیدی بود!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiProperty({
    description: 'آیدی پستی که کامنت روی آن ثبت می‌شود',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  postId: number;

  @ApiPropertyOptional({
    description: 'آیدی کامنت والد (اگر این یک ریپلای است)',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentId?: number;

  @ApiPropertyOptional({
    description: 'آیدی کاربری که مستقیماً به او ریپلای زده شده',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  replyToUserId?: number;
}
