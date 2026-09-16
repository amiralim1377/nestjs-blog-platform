import { FileMetadata } from './file-metadata.interface.js';

export interface StorageService {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<FileMetadata>;
  deleteFile(path: string): Promise<boolean>;
}
