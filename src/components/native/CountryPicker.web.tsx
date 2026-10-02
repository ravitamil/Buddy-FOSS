import React from 'react';
import {YStack} from 'tamagui';

export type CountryCode = string;

export interface Country {
  cca2?: CountryCode;
  callingCode?: string[];
  name?: string;
  currency?: string[];
  region?: string;
  subregion?: string;
  flag?: string;
}

export interface CountryPickerProps {
  countryCode?: CountryCode;
  withFilter?: boolean;
  withFlag?: boolean;
  withCallingCode?: boolean;
  withEmoji?: boolean;
  onSelect?: (country: Country) => void;
  visible?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  containerButtonStyle?: any;
  theme?: any;
}

export default function CountryPicker(_props: CountryPickerProps) {
  // Web platform is not supported; return a no-op placeholder to avoid bundling issues.
  return <YStack />;
}
