import {AuthMethod} from '@/types/context-foundation';

export const ONBOARDING_STEPS = [0, 1, 2] as const;
export const LAST_ONBOARDING_STEP = ONBOARDING_STEPS.length - 1;

export const createEmptyOnboardingProfile = () => ({
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: new Date(),
  currencyPreference: '',
  mobileNumber: undefined,
  emailAddress: undefined,
  profilePictureUri: undefined,
});

export const sanitizeOnboardingInput = (input: string, shouldTrim = false): string => {
  const sanitized = input
    .replace(/['";\\-]/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[%<>]/g, '');

  return shouldTrim ? sanitized.trim() : sanitized;
};

export const normalizeOnboardingAuthMethod = (
  value: unknown,
): AuthMethod.EMAIL | AuthMethod.PHONE | AuthMethod.GOOGLE | null => {
  if (typeof value !== 'string') return null;

  const normalized = value.toLowerCase();

  if (normalized === 'phone') return AuthMethod.PHONE;
  if (normalized === 'email' || normalized === 'password') return AuthMethod.EMAIL;
  if (normalized === 'google' || normalized === 'google.com') {
    return AuthMethod.GOOGLE;
  }

  return null;
};

export const isLocalProfilePictureUri = (uri: string) =>
  uri.startsWith('file:') || uri.startsWith('content:') || !uri.startsWith('http');
