import type {Country, CountryCode} from '../../components/native/CountryPicker';

export interface PhoneInputState {
  phoneNumber: string;
  isLoading: boolean;
  countryCode: CountryCode;
  country: Country | null;
  showCountryPicker: boolean;
}

interface ThemeToken {
  val?: unknown;
}

type ThemeTokenName =
  | 'background'
  | 'green8'
  | 'iconBrand'
  | 'placeholderColor'
  | 'primary'
  | 'primaryFocus'
  | 'success'
  | 'text'
  | 'textTertiary';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const defaultIndiaCountry: Country = {
  cca2: 'IN',
  currency: ['INR'],
  flag: '🇮🇳',
  name: 'India',
  region: 'Asia',
  subregion: 'Southern Asia',
  callingCode: ['91'],
};

export const getThemeColor = (
  theme: unknown,
  tokenName: ThemeTokenName,
  fallback: string,
): string => {
  if (!isRecord(theme)) {
    return fallback;
  }

  const token = theme[tokenName] as ThemeToken | undefined;
  return typeof token?.val === 'string' ? token.val : fallback;
};

export const getCountryDisplayName = (country: Country | null): string => {
  const countryName = country?.name;

  if (typeof countryName === 'string') {
    return countryName;
  }

  if (isRecord(countryName) && typeof countryName.common === 'string') {
    return countryName.common;
  }

  return 'the selected country';
};

export const formatPhoneNumber = (value: string, country: Country | null): string => {
  if (!value) return '';

  const phoneNumber = value.replace(/\D/g, '');

  if (country?.cca2 === 'US' || country?.cca2 === 'CA') {
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }

  if (country?.cca2 === 'GB') {
    if (phoneNumber.length < 5) return phoneNumber;
    if (phoneNumber.length < 8) return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4)}`;
    return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7, 11)}`;
  }

  if (country?.cca2 === 'IN') {
    if (phoneNumber.length < 6) return phoneNumber;
    return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5, 10)}`;
  }

  if (phoneNumber.length < 4) return phoneNumber;
  if (phoneNumber.length < 7) return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
  return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
};

export const getPhoneNumberLength = (country: Country | null): number => {
  switch (country?.cca2) {
    case 'AU':
    case 'FR':
      return 9;
    case 'DE':
    case 'CN':
    case 'BR':
      return 11;
    default:
      return 10;
  }
};

export const isValidPhoneNumber = (phoneNumber: string, country: Country | null): boolean => {
  const numericOnly = phoneNumber.replace(/\D/g, '');
  return numericOnly.length === getPhoneNumberLength(country);
};

export const getPlaceholder = (country: Country | null): string => {
  switch (country?.cca2) {
    case 'US':
    case 'CA':
      return '(555) 123-4567';
    case 'GB':
      return '7911 123456';
    case 'IN':
      return '98765 43210';
    case 'AU':
      return '412 345 678';
    case 'DE':
      return '151 23456789';
    case 'FR':
      return '6 12 34 56 78';
    case 'JP':
      return '90 1234 5678';
    case 'CN':
      return '138 0013 8000';
    case 'BR':
      return '(11) 99999-9999';
    default:
      return 'Enter phone number';
  }
};
