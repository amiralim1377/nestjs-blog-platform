import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUploadDto } from './create-upload.dto.js';

export class UpdateUploadDto extends PartialType(
  OmitType(CreateUploadDto, ['file'] as const),
) {}
