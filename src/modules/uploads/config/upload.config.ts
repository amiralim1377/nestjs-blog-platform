import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  /**
   * Active storage provider: 'supabase' or 'local'.
   */
  driver: process.env.STORAGE_DRIVER || 'supabase',

  /**
   * Storage bucket name in Supabase.
   */
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || 'blog-assets',

  /**
   * Maximum allowed file upload size in bytes.
   * Default: 3 MB.
   */
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '3145728', 10), // 3 * 1024 * 1024

  /**
   * Directory for storing files on the server.
   * Used when the 'local' driver is selected.
   */
  localDestination: process.env.UPLOAD_LOCAL_DESTINATION || 'uploads',

  /**
   * List of allowed MIME types for file validation.
   */
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
}));
