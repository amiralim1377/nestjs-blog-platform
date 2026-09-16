import {
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { UPLOAD_LIMITS } from '../constants/upload.constants.js';

@Injectable()
export class FileValidationPipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        new MaxFileSizeValidator({
          maxSize: UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES,
        }),
        new FileTypeValidator({
          fileType: UPLOAD_LIMITS.ALLOWED_EXTENSIONS_REGEX,
        }),
      ],
      fileIsRequired: true,
    });
  }
}
