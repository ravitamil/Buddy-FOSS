import type {OnboardingProfileData} from '../types';

export const getOnboardingStepErrors = (
  step: number,
  formData: OnboardingProfileData,
  today = new Date(),
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (step === 0) {
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.displayName.trim()) errors.displayName = 'Display name is required';
  }

  if (step === 1) {
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    if (formData.dateOfBirth > eighteenYearsAgo) {
      errors.dateOfBirth = 'You must be at least 18 years old';
    }
  }

  if (step === 2 && !formData.currencyPreference) {
    errors.currencyPreference = 'Currency preference is required';
  }

  return errors;
};
