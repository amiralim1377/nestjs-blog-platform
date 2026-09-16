import {
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
      ],
      fileIsRequired: true,
    });
  }
}
