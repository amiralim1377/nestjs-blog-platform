import { IntersectionType } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PostStatus } from '../enums/postStatus.enum.js';
import { PaginationQueryDto } from '../../../common/pagination/dto/pagination.query.dto.js';

class GetPostsBaseDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}

export class GetPostsDto extends IntersectionType(
  GetPostsBaseDto,
  PaginationQueryDto,
) {}
