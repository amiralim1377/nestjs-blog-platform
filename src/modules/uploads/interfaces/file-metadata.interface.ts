export interface FileMetadata {
  /** * Full public URL of the file for displaying it on the frontend. */
  url: string;

  /** * Storage path of the file in the bucket. * Used for accessing or deleting the file in the future. * Example: "avatars/a7f8e3-image.webp" */ path: string;
  /** * Original filename provided by the user during upload. */
  originalName?: string;
  /** * MIME type of the file. * Example: "image/jpeg" */
  mimeType: string;
  /** * File size in bytes. */
  size: number;
  /** * Storage provider. * Example: "Supabase", "Local", or "S3". */
  provider?: string;
}
