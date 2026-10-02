import {SupabaseStorageService} from '@/services/SupabaseStorageService';
import {validateReceiptFile} from './addGroupTransactionReceiptValidation';

export const uploadGroupReceipt = async (
  groupId: string,
  receiptUri: string,
  fileName?: string,
  mimeType?: string,
): Promise<string | null> => {
  const validation = await validateReceiptFile({
    uri: receiptUri,
    name: fileName,
    mimeType,
  });

  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid receipt format or file exceeds 1 MB');
  }

  return SupabaseStorageService.uploadGroupReceipt(
    groupId,
    `${Date.now()}`,
    receiptUri,
    fileName || `receipt.${validation.extension}`,
    validation.mimeType,
  );
};
