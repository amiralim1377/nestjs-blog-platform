import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { FILE_SIGNATURES } from '../constants/upload.constants.js';
@Injectable()
export class FileSignaturePipe implements PipeTransform<
  Express.Multer.File,
  Express.Multer.File
> {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file || !file.buffer) {
      throw new BadRequestException('There is no file to check.');
    }
    const header = file.buffer.subarray(0, 12).toString('hex').toLowerCase();
    const isJpeg = header.startsWith(FILE_SIGNATURES.JPEG);
    const isPng = header.startsWith(FILE_SIGNATURES.PNG);
    const isWebp =
      header.startsWith(FILE_SIGNATURES.RIFF) &&
      header.slice(16, 24) === FILE_SIGNATURES.WEBP;

    const isValidImage = isJpeg || isPng || isWebp;
    if (!isValidImage) {
      throw new BadRequestException(
        'The file content does not match the binary signature of the allowed formats (JPG, PNG, WEBP).',
      );
    }
    return file;
  }
}
