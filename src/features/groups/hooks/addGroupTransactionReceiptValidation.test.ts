import {
  ALLOWED_RECEIPT_EXTENSIONS,
  ALLOWED_RECEIPT_MIME_TYPES,
  getFileExtension,
  isAllowedFileExtension,
  isAllowedMimeType,
  MAX_RECEIPT_SIZE_BYTES,
  validateReceiptFile,
} from './addGroupTransactionReceiptValidation';

describe('Group Transaction Receipt Validation', () => {
  it('validates file sizes and allowed constants', () => {
    expect(MAX_RECEIPT_SIZE_BYTES).toBe(1024 * 1024);
    expect(ALLOWED_RECEIPT_EXTENSIONS).toContain('jpg');
    expect(ALLOWED_RECEIPT_MIME_TYPES).toContain('image/jpeg');
  });

  it('identifies allowed file extensions', () => {
    expect(isAllowedFileExtension('jpg')).toBe(true);
    expect(isAllowedFileExtension('jpeg')).toBe(true);
    expect(isAllowedFileExtension('png')).toBe(true);
    expect(isAllowedFileExtension('pdf')).toBe(true);
    expect(isAllowedFileExtension('doc')).toBe(true);
    expect(isAllowedFileExtension('docx')).toBe(true);
    expect(isAllowedFileExtension('exe')).toBe(false);
    expect(isAllowedFileExtension('zip')).toBe(false);
  });

  it('identifies allowed MIME types', () => {
    expect(isAllowedMimeType('image/jpeg')).toBe(true);
    expect(isAllowedMimeType('image/png')).toBe(true);
    expect(isAllowedMimeType('application/pdf')).toBe(true);
    expect(isAllowedMimeType('application/msword')).toBe(true);
    expect(isAllowedMimeType('application/x-msdownload')).toBe(false);
  });

  it('extracts file extension from name or uri', () => {
    expect(getFileExtension('invoice.pdf')).toBe('pdf');
    expect(getFileExtension('photo.PNG')).toBe('png');
    expect(getFileExtension('file:///path/to/doc.docx?token=123')).toBe('docx');
  });

  it('validates files before upload correctly', async () => {
    const validResult = await validateReceiptFile({
      uri: 'file://receipt.pdf',
      name: 'receipt.pdf',
      mimeType: 'application/pdf',
      size: 500 * 1024,
    });
    expect(validResult.valid).toBe(true);
    expect(validResult.extension).toBe('pdf');

    const oversizedResult = await validateReceiptFile({
      uri: 'file://large_bill.png',
      name: 'large_bill.png',
      size: 2 * 1024 * 1024,
    });
    expect(oversizedResult.valid).toBe(false);
    expect(oversizedResult.error).toContain('strictly under 1 MB');

    const unsupportedResult = await validateReceiptFile({
      uri: 'file://malware.exe',
      name: 'malware.exe',
      mimeType: 'application/x-msdownload',
      size: 100 * 1024,
    });
    expect(unsupportedResult.valid).toBe(false);
    expect(unsupportedResult.error).toContain('Unsupported file format');
  });
});
