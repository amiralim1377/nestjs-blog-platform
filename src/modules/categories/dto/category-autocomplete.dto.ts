import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryAutocompleteDto {
  @ApiProperty({
    description: 'The search keyword typed by the user',
    example: 'بک اند',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  keyword: string;
}
