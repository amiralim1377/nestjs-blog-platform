import { ApiProperty, PartialType } from '@nestjs/swagger';

import { CreatePostDto } from './create-post.dto.js';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({
    description: 'The ID of the post to update',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id: number;
}
