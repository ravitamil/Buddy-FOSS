import React from 'react';

import {
  CombinedPersonalInfoStep,
  CurrencyPreferenceStep,
  ModernDateOfBirthStep,
} from '@/features/onboarding/components';
import type {OnboardingScreenModel} from '../types';

interface OnboardingStepContentProps {
  screen: OnboardingScreenModel;
}

export function OnboardingStepContent({screen}: OnboardingStepContentProps) {
  if (screen.currentStep === 0) {
    return (
      <CombinedPersonalInfoStep
        firstName={screen.formData.firstName}
        lastName={screen.formData.lastName}
        displayName={screen.formData.displayName}
        profilePictureUri={screen.formData.profilePictureUri}
        onInputChange={screen.handleInputChange}
        onProfilePictureChange={screen.handleProfilePictureChange}
        onNext={screen.goToNextStep}
        onBack={screen.handleGoBack}
        errors={screen.errors}
        userId={screen.userId}
      />
    );
  }

  if (screen.currentStep === 1) {
    return (
      <ModernDateOfBirthStep
        dateOfBirth={screen.formData.dateOfBirth}
        onDateChange={screen.handleDateChange}
        onNext={screen.goToNextStep}
        onBack={screen.goToPreviousStep}
        errors={screen.errors}
      />
    );
  }

  if (screen.currentStep === 2) {
    return (
      <CurrencyPreferenceStep
        currencyPreference={screen.formData.currencyPreference}
        onCurrencyChange={screen.handleCurrencyChange}
        onNext={screen.goToNextStep}
        onBack={screen.goToPreviousStep}
        errors={screen.errors}
      />
    );
  }

  return null;
}
