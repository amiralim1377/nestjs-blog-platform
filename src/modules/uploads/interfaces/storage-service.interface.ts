export interface StorageService {
  uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{ path: string; url: string }>;
  deleteFile(path: string): Promise<boolean>;
}
