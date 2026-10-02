import {supabase} from '../lib/supabase';
import {logger as appLogger} from './LoggerService';
import {fileSystem, EncodingType} from './filesystem/fileSystemAdapter';

const logger = appLogger.serviceLogger('SupabaseStorageService');

const BUCKET_NAME = 'avatars';
const GROUP_RECEIPTS_BUCKET = 'group-receipts';

const MIME_TYPE_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

/**
 * Resolves the MIME type from a URI or filename extension
 */
export function getMimeTypeFromUri(uri: string, fallback: string = 'image/jpeg'): string {
  const cleanUri = uri.split('?')[0].split('#')[0].toLowerCase();
  const ext = cleanUri.split('.').pop();
  if (ext && MIME_TYPE_MAP[ext]) {
    return MIME_TYPE_MAP[ext];
  }
  return fallback;
}

/**
 * Converts a base64 string (or data URI) into an ArrayBuffer.
 * React Native + Supabase Storage requires ArrayBuffer for raw binary POST uploads.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  if (typeof atob === 'function') {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Pure JS lookup table fallback
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = base64Data.length * 0.75;
  const len = base64Data.length;
  let p = 0;

  if (base64Data[base64Data.length - 1] === '=') {
    bufferLength--;
    if (base64Data[base64Data.length - 2] === '=') {
      bufferLength--;
    }
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[base64Data.charCodeAt(i)];
    const encoded2 = lookup[base64Data.charCodeAt(i + 1)];
    const encoded3 = lookup[base64Data.charCodeAt(i + 2)];
    const encoded4 = lookup[base64Data.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== undefined && base64Data[i + 2] !== '=') {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (encoded4 !== undefined && base64Data[i + 3] !== '=') {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
}

/**
 * Reads a local file URI (file://, content://, data:*) into an ArrayBuffer
 */
async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  if (uri.startsWith('data:')) {
    return base64ToArrayBuffer(uri);
  }
  const base64 = await fileSystem.readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  return base64ToArrayBuffer(base64);
}

export class SupabaseStorageService {
  /**
   * Upload an avatar to Supabase Storage
   * @param userId The user's unique ID
   * @param localUri The local URI of the image (from picker or filesystem)
   * @returns The public URL of the uploaded image
   */
  static async uploadAvatar(userId: string, localUri: string): Promise<string> {
    try {
      logger.operation('uploadAvatar', {userId, localUri});

      if (!userId) {
        throw new Error('User ID is required to upload avatar');
      }

      if (!localUri) {
        throw new Error('Local URI is required to upload avatar');
      }

      // If it is already a remote Supabase URL for this bucket, return it directly
      if (
        (localUri.startsWith('http://') || localUri.startsWith('https://')) &&
        localUri.includes(BUCKET_NAME)
      ) {
        return localUri;
      }

      // 1. Read file as binary ArrayBuffer (supported in React Native + Supabase storage)
      const arrayBuffer = await readUriAsArrayBuffer(localUri);
      const mimeType = getMimeTypeFromUri(localUri, 'image/jpeg');

      // 2. Define path: {userId}/profile.jpg (ensures 1 avatar per user, easy to cache)
      const filePath = `${userId}/profile.jpg`;

      // 3. Upload binary ArrayBuffer to Supabase Storage
      const {data, error} = await supabase.storage.from(BUCKET_NAME).upload(filePath, arrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

      if (error) {
        logger.error('Error uploading avatar to Supabase:', {
          message: error.message,
          name: error.name,
          error,
        });
        throw error;
      }

      // 4. Get the public URL
      const {data: publicUrlData} = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      // Add cache busting query param
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      logger.info('Avatar uploaded successfully', {url: finalUrl, path: data?.path});
      return finalUrl;
    } catch (error) {
      logger.error('Failed to upload avatar', error);
      throw error;
    }
  }

  /**
   * Get the public URL for a user's avatar
   * @param userId The user's unique ID
   */
  static getAvatarUrl(userId: string): string {
    const filePath = `${userId}/profile.jpg`;
    const {data} = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return `${data.publicUrl}?t=${Date.now()}`;
  }

  /**
   * Remove a user's avatar from storage
   * @param userId The user's unique ID
   */
  static async removeAvatar(userId: string): Promise<void> {
    try {
      const filePath = `${userId}/profile.jpg`;
      const {error} = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

      if (error) throw error;
      logger.info('Avatar removed successfully', {userId});
    } catch (error) {
      logger.error('Error removing avatar:', error);
      throw error;
    }
  }

  /**
   * Upload a group expense receipt to Supabase Storage
   * @param groupId The group's unique ID
   * @param transactionId The specific transaction ID (expense ID)
   * @param localUri The local URI of the image (from picker or filesystem)
   * @param fileName Optional file name with extension
   * @param mimeType Optional MIME type
   * @returns The public URL of the uploaded receipt
   */
  static async uploadGroupReceipt(
    groupId: string,
    transactionId: string,
    localUri: string,
    fileName: string = 'receipt.jpg',
    mimeType?: string,
  ): Promise<string> {
    try {
      logger.operation('uploadGroupReceipt', {
        groupId,
        transactionId,
        localUri,
        fileName,
        mimeType,
      });

      if (!groupId || !transactionId) {
        throw new Error('Group ID and transaction ID are required to upload receipt');
      }

      if (!localUri) {
        throw new Error('Local URI is required to upload receipt');
      }

      if (
        (localUri.startsWith('http://') || localUri.startsWith('https://')) &&
        localUri.includes(GROUP_RECEIPTS_BUCKET)
      ) {
        return localUri;
      }

      const extension = fileName.includes('.') ? fileName.split('.').pop() || 'jpg' : 'jpg';
      const effectiveMimeType = mimeType || getMimeTypeFromUri(fileName || localUri, 'image/jpeg');

      // Convert local file to binary ArrayBuffer
      const arrayBuffer = await readUriAsArrayBuffer(localUri);
      const filePath = `${groupId}/${transactionId}.${extension}`;

      const {data, error} = await supabase.storage
        .from(GROUP_RECEIPTS_BUCKET)
        .upload(filePath, arrayBuffer, {
          contentType: effectiveMimeType,
          upsert: true,
        });

      if (error) {
        logger.error('Error uploading receipt to Supabase:', {
          message: error.message,
          name: error.name,
          error,
        });
        throw error;
      }

      const {data: publicUrlData} = supabase.storage
        .from(GROUP_RECEIPTS_BUCKET)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      logger.info('Group receipt uploaded successfully', {url: finalUrl, path: data?.path});
      return finalUrl;
    } catch (error) {
      logger.error('Failed to upload group receipt', error);
      throw error;
    }
  }

  /**
   * Get the public URL for a group expense receipt
   */
  static getGroupReceiptUrl(groupId: string, transactionId: string): string {
    const filePath = `${groupId}/${transactionId}.jpg`;
    const {data} = supabase.storage.from(GROUP_RECEIPTS_BUCKET).getPublicUrl(filePath);

    return `${data.publicUrl}?t=${Date.now()}`;
  }

  /**
   * Remove a receipt from storage
   */
  static async removeGroupReceipt(groupId: string, transactionId: string): Promise<void> {
    try {
      const filePath = `${groupId}/${transactionId}.jpg`;
      const {error} = await supabase.storage.from(GROUP_RECEIPTS_BUCKET).remove([filePath]);

      if (error) throw error;
      logger.info('Receipt removed successfully', {groupId, transactionId});
    } catch (error) {
      logger.error('Error removing receipt:', error);
      throw error;
    }
  }
}

export default SupabaseStorageService;
