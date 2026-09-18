import { PickType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto.js';

export class UpdateCommentDto extends PickType(CreateCommentDto, [
  'content',
] as const) {}
