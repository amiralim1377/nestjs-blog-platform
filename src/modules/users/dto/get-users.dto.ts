import { IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/pagination/dto/pagination.query.dto.js';
import { UserRole } from '../enums/user-role.enum.js';

class GetUsersBaseDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

export class GetUsersDto extends IntersectionType(
  GetUsersBaseDto,
  PaginationQueryDto,
) {}
