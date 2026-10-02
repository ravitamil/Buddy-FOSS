import type {AuthMethod} from '@/types/context-foundation';

export interface OnboardingProfileData {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: Date;
  currencyPreference: string;
  mobileNumber?: string;
  emailAddress?: string;
  profilePictureUri?: string;
}

export interface OnboardingScreenModel {
  currentStep: number;
  formData: OnboardingProfileData;
  errors: Record<string, string>;
  authMethod: AuthMethod.EMAIL | AuthMethod.PHONE | AuthMethod.GOOGLE | null;
  userId?: string;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleGoBack: () => void;
  handleInputChange: (field: string, value: string) => void;
  handleProfilePictureChange: (uri: string) => void;
  handleDateChange: (date: Date) => void;
  handleCurrencyChange: (currency: string) => void;
  showSuccess: boolean;
}
