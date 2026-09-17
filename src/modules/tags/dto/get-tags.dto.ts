import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/pagination/dto/pagination.query.dto.js';

export class GetTagBaseDto {
  @ApiPropertyOptional({
    description: 'Search tags by name',
    example: 'هوش مصنوعی',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  search?: string;
}

export class GetTagDto extends IntersectionType(
  GetTagBaseDto,
  PaginationQueryDto,
) {}
