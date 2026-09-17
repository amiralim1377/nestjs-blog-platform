import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/pagination/dto/pagination.query.dto.js';

export class GetCategoriesBaseDto {
  @ApiPropertyOptional({
    description: 'Search categories by name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  search?: string;
}

export class GetCategoriesDto extends IntersectionType(
  GetCategoriesBaseDto,
  PaginationQueryDto,
) {}
