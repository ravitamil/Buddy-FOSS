import {
  SupabaseStorageService,
  base64ToArrayBuffer,
  getMimeTypeFromUri,
} from './SupabaseStorageService';

type StorageBucketApi = {
  upload: (
    path: string,
    body: unknown,
    options?: unknown,
  ) => Promise<{data: {path: string} | null; error: Error | null}>;
  getPublicUrl: (path: string) => {data: {publicUrl: string}};
  remove: (paths: string[]) => Promise<{error: Error | null}>;
};

const mockFrom = jest.fn<StorageBucketApi, [string]>();
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockRemove = jest.fn();
const mockReadAsStringAsync = jest.fn<Promise<string>, [string, unknown]>();

jest.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: (bucket: string): StorageBucketApi => mockFrom(bucket),
    },
  },
}));

jest.mock('./filesystem/fileSystemAdapter', () => ({
  fileSystem: {
    readAsStringAsync: (uri: string, options: unknown): Promise<string> =>
      mockReadAsStringAsync(uri, options),
  },
  EncodingType: {
    Base64: 'base64',
  },
}));

describe('SupabaseStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockFrom.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
      remove: mockRemove,
    });
  });

  describe('base64ToArrayBuffer and getMimeTypeFromUri', () => {
    it('correctly converts base64 to ArrayBuffer', () => {
      // "Hello World" in base64 is "SGVsbG8gV29ybGQ="
      const buffer = base64ToArrayBuffer('SGVsbG8gV29ybGQ=');
      const bytes = new Uint8Array(buffer);
      const text = String.fromCharCode(...bytes);
      expect(text).toBe('Hello World');
    });

    it('handles data URI prefix when decoding base64', () => {
      const buffer = base64ToArrayBuffer('data:image/jpeg;base64,SGVsbG8gV29ybGQ=');
      const bytes = new Uint8Array(buffer);
      const text = String.fromCharCode(...bytes);
      expect(text).toBe('Hello World');
    });

    it('resolves correct MIME types from file extensions', () => {
      expect(getMimeTypeFromUri('file:///path/to/image.jpg')).toBe('image/jpeg');
      expect(getMimeTypeFromUri('file:///path/to/image.jpeg')).toBe('image/jpeg');
      expect(getMimeTypeFromUri('file:///path/to/image.png')).toBe('image/png');
      expect(getMimeTypeFromUri('file:///path/to/image.webp')).toBe('image/webp');
      expect(getMimeTypeFromUri('file:///path/to/doc.pdf')).toBe('application/pdf');
      expect(getMimeTypeFromUri('file:///path/to/unknown.xyz')).toBe('image/jpeg');
    });
  });

  describe('uploadAvatar', () => {
    it('reads local file as base64, uploads ArrayBuffer to Supabase, and returns public URL', async () => {
      const userId = 'test-user-123';
      const localUri = 'file:///data/user/0/cache/avatar.jpg';
      const base64Data = 'SGVsbG8gV29ybGQ=';

      mockReadAsStringAsync.mockResolvedValue(base64Data);
      mockUpload.mockResolvedValue({data: {path: `${userId}/profile.jpg`}, error: null});
      mockGetPublicUrl.mockReturnValue({
        data: {
          publicUrl:
            'https://example.supabase.co/storage/v1/object/public/avatars/test-user-123/profile.jpg',
        },
      });

      const result = await SupabaseStorageService.uploadAvatar(userId, localUri);

      expect(mockReadAsStringAsync).toHaveBeenCalledWith(localUri, {encoding: 'base64'});
      expect(mockFrom).toHaveBeenCalledWith('avatars');
      expect(mockUpload).toHaveBeenCalledWith(`${userId}/profile.jpg`, expect.any(ArrayBuffer), {
        contentType: 'image/jpeg',
        upsert: true,
      });
      expect(result).toContain(
        'https://example.supabase.co/storage/v1/object/public/avatars/test-user-123/profile.jpg?t=',
      );
    });

    it('returns existing URL if it is already a remote Supabase avatar URL', async () => {
      const userId = 'test-user-123';
      const existingUrl =
        'https://example.supabase.co/storage/v1/object/public/avatars/test-user-123/profile.jpg';

      const result = await SupabaseStorageService.uploadAvatar(userId, existingUrl);

      expect(result).toBe(existingUrl);
      expect(mockReadAsStringAsync).not.toHaveBeenCalled();
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('throws when upload returns an error', async () => {
      const userId = 'test-user-123';
      const localUri = 'file:///data/user/0/cache/avatar.jpg';

      mockReadAsStringAsync.mockResolvedValue('SGVsbG8gV29ybGQ=');
      mockUpload.mockResolvedValue({data: null, error: new Error('Storage error')});

      await expect(SupabaseStorageService.uploadAvatar(userId, localUri)).rejects.toThrow(
        'Storage error',
      );
    });

    it('throws when userId or localUri is missing', async () => {
      await expect(SupabaseStorageService.uploadAvatar('', 'file:///avatar.jpg')).rejects.toThrow(
        'User ID is required',
      );
      await expect(SupabaseStorageService.uploadAvatar('user-1', '')).rejects.toThrow(
        'Local URI is required',
      );
    });
  });

  describe('uploadGroupReceipt', () => {
    it('uploads group receipt with correct path and content type', async () => {
      const groupId = 'group-123';
      const transactionId = 'tx-456';
      const localUri = 'file:///receipts/food.png';

      mockReadAsStringAsync.mockResolvedValue('SGVsbG8gV29ybGQ=');
      mockUpload.mockResolvedValue({data: {path: `${groupId}/${transactionId}.png`}, error: null});
      mockGetPublicUrl.mockReturnValue({
        data: {
          publicUrl: `https://example.supabase.co/storage/v1/object/public/group-receipts/${groupId}/${transactionId}.png`,
        },
      });

      const result = await SupabaseStorageService.uploadGroupReceipt(
        groupId,
        transactionId,
        localUri,
        'food.png',
        'image/png',
      );

      expect(mockFrom).toHaveBeenCalledWith('group-receipts');
      expect(mockUpload).toHaveBeenCalledWith(
        `${groupId}/${transactionId}.png`,
        expect.any(ArrayBuffer),
        {
          contentType: 'image/png',
          upsert: true,
        },
      );
      expect(result).toContain(
        `https://example.supabase.co/storage/v1/object/public/group-receipts/${groupId}/${transactionId}.png?t=`,
      );
    });
  });

  describe('getAvatarUrl and getGroupReceiptUrl', () => {
    it('constructs public avatar URL with timestamp', () => {
      mockGetPublicUrl.mockReturnValue({
        data: {publicUrl: 'https://example.supabase.co/avatars/user-1/profile.jpg'},
      });

      const url = SupabaseStorageService.getAvatarUrl('user-1');
      expect(url).toContain('https://example.supabase.co/avatars/user-1/profile.jpg?t=');
    });

    it('constructs public receipt URL with timestamp', () => {
      mockGetPublicUrl.mockReturnValue({
        data: {publicUrl: 'https://example.supabase.co/group-receipts/group-1/tx-1.jpg'},
      });

      const url = SupabaseStorageService.getGroupReceiptUrl('group-1', 'tx-1');
      expect(url).toContain('https://example.supabase.co/group-receipts/group-1/tx-1.jpg?t=');
    });
  });

  describe('removeAvatar and removeGroupReceipt', () => {
    it('removes avatar from bucket', async () => {
      mockRemove.mockResolvedValue({error: null});

      await SupabaseStorageService.removeAvatar('user-1');
      expect(mockRemove).toHaveBeenCalledWith(['user-1/profile.jpg']);
    });

    it('throws if removing avatar fails', async () => {
      mockRemove.mockResolvedValue({error: new Error('Failed to delete')});

      await expect(SupabaseStorageService.removeAvatar('user-1')).rejects.toThrow(
        'Failed to delete',
      );
    });

    it('removes receipt from bucket', async () => {
      mockRemove.mockResolvedValue({error: null});

      await SupabaseStorageService.removeGroupReceipt('group-1', 'tx-1');
      expect(mockRemove).toHaveBeenCalledWith(['group-1/tx-1.jpg']);
    });
  });
});
