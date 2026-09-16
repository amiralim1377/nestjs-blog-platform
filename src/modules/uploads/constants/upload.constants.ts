export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export const UPLOAD_FOLDERS = {
  AVATARS: 'avatars',
  COVERS: 'covers',
  POSTS: 'posts',
  GENERAL: 'general',
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_BYTES: 3 * 1024 * 1024,
  ALLOWED_EXTENSIONS_REGEX: /(jpg|jpeg|png|webp)$/i,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
};

export const FILE_SIGNATURES = {
  JPEG: 'ffd8ff',
  PNG: '89504e47',
  RIFF: '52494646',
  WEBP: '57454250',
} as const;
