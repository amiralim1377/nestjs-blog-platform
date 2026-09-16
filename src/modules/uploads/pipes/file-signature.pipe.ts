import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { FILE_SIGNATURES } from '../constants/upload.constants.js';
import { extname } from 'path';

@Injectable()
export class FileSignaturePipe implements PipeTransform<
  Express.Multer.File,
  Express.Multer.File
> {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is missing.');
    }

    const header = file.buffer.subarray(0, 12).toString('hex').toLowerCase();
    const ext = extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    let detectedFormat: 'jpeg' | 'png' | 'webp' | null = null;

    if (header.startsWith(FILE_SIGNATURES.JPEG)) {
      detectedFormat = 'jpeg';
    } else if (header.startsWith(FILE_SIGNATURES.PNG)) {
      detectedFormat = 'png';
    } else if (
      header.startsWith(FILE_SIGNATURES.RIFF) &&
      header.slice(16, 24) === FILE_SIGNATURES.WEBP
    ) {
      detectedFormat = 'webp';
    }

    if (!detectedFormat) {
      throw new BadRequestException(
        'File content does not match allowed binary signatures.',
      );
    }

    const isValid =
      (detectedFormat === 'jpeg' &&
        ['.jpg', '.jpeg'].includes(ext) &&
        mime === 'image/jpeg') ||
      (detectedFormat === 'png' && ext === '.png' && mime === 'image/png') ||
      (detectedFormat === 'webp' && ext === '.webp' && mime === 'image/webp');

    if (!isValid) {
      throw new BadRequestException(
        'File extension and MIME type do not match the actual file content.',
      );
    }

    return file;
  }
}
