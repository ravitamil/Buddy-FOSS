import * as FileSystem from 'expo-file-system';

export const MAX_RECEIPT_SIZE_BYTES = 1024 * 1024; // 1 MB

export const ALLOWED_RECEIPT_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'pdf',
  'doc',
  'docx',
  'txt',
] as const;

export const ALLOWED_RECEIPT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export interface ReceiptValidationResult {
  valid: boolean;
  error?: string;
  fileSize?: number;
  extension: string;
  mimeType: string;
}

export const getFileExtension = (nameOrUri?: string): string => {
  if (!nameOrUri) return 'jpg';
  const cleanPath = nameOrUri.split('?')[0].split('#')[0];
  const parts = cleanPath.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return 'jpg';
};

export const getMimeTypeFromExtension = (extension: string): string => {
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
};

export const isAllowedFileExtension = (extension: string): boolean => {
  return (ALLOWED_RECEIPT_EXTENSIONS as readonly string[]).includes(extension.toLowerCase());
};

export const isAllowedMimeType = (mimeType?: string): boolean => {
  if (!mimeType) return true;
  const cleanMime = mimeType.split(';')[0].trim().toLowerCase();
  return (
    cleanMime.startsWith('image/') ||
    (ALLOWED_RECEIPT_MIME_TYPES as readonly string[]).includes(cleanMime)
  );
};

export const validateReceiptFile = async ({
  uri,
  name,
  mimeType,
  size,
}: {
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
}): Promise<ReceiptValidationResult> => {
  const extension = getFileExtension(name || uri);

  // 1. Validate File Format
  if (!isAllowedFileExtension(extension) && !isAllowedMimeType(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file format (.${extension}). Only .jpg, .png, .pdf, .doc files are supported.`,
      extension,
      mimeType: mimeType || getMimeTypeFromExtension(extension),
    };
  }

  // 2. Validate File Size
  let fileSize = size;
  if (!fileSize && uri) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && 'size' in fileInfo && typeof fileInfo.size === 'number') {
        fileSize = fileInfo.size;
      }
    } catch {
      // Ignore filesystem error
    }
  }

  if (fileSize && fileSize > MAX_RECEIPT_SIZE_BYTES) {
    const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Selected file is ${sizeMb} MB. Receipt uploads must be strictly under 1 MB.`,
      fileSize,
      extension,
      mimeType: mimeType || getMimeTypeFromExtension(extension),
    };
  }

  return {
    valid: true,
    fileSize,
    extension,
    mimeType: mimeType || getMimeTypeFromExtension(extension),
  };
};
