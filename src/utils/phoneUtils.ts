/**
 * Utility functions for phone number standardization and formatting.
 */

/**
 * Standardizes a phone number by removing all non-numeric characters except the leading '+'.
 * If the number starts with '0', it's often a local format that might need replacement
 * with a country code, but for now we'll just clean it to stay consistent.
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  // Remove all non-digit characters except '+'
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If it starts with '00', replace with '+'
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.substring(2);
  }

  // Handle common local format (e.g., India 0... -> +91...)
  // This is a bit opinionated, but standard for many apps.
  // For now, let's keep it simple and just return the cleaned digits.

  return cleaned;
};

/**
 * Validates if a string looks like a valid phone number.
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = formatPhoneNumber(phone);
  // Basic validation: at least 7 digits, at most 15
  const digitsOnly = cleaned.replace(/\+/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};
