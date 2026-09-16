import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UploadsService } from './providers/uploads.service.js';
import { FileValidationPipe } from './pipes/file-validation.pipe.js';
import { FileSignaturePipe } from './pipes/file-signature.pipe.js';
import { CreateUploadDto } from './dto/create-upload.dto.js';
import { UPLOAD_FOLDERS, UPLOAD_LIMITS } from './constants/upload.constants.js';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface.js';
import { ActiveUser } from '../auth/decorator/active-user.decorator.js';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('file')
  @ApiOperation({ summary: 'Upload a new file to storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: {
          type: 'string',
          enum: Object.values(UPLOAD_FOLDERS),
          default: UPLOAD_FOLDERS.POSTS,
        },
        altText: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES },
    }),
  )
  public async uploadFile(
    @UploadedFile(FileValidationPipe, FileSignaturePipe)
    file: Express.Multer.File,
    @Body() createUploadDto: CreateUploadDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.uploadsService.uploadFile(
      file,
      user,
      createUploadDto.folder || UPLOAD_FOLDERS.POSTS,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file securely' })
  public async deleteFile(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.uploadsService.deleteFile(id, user);
  }
}
