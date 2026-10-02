import {createCurrencyOption, LANGUAGES} from '@/constants/currencies';

import type {SettingsCurrencyViewModel, SettingsLanguageViewModel} from './settingsScreenTypes';

const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
};

interface SettingsIdentity {
  firstName?: string | null;
  profileDisplayName?: string | null;
  userDisplayName?: string | null;
  email?: string | null;
}

type UserInfoResolver = (firstName?: string, displayName?: string) => {name: string};

export const resolveSettingsDisplayName = (
  identity: SettingsIdentity,
  resolveUserInfo: UserInfoResolver,
) => {
  try {
    return resolveUserInfo(
      identity.firstName ?? undefined,
      identity.profileDisplayName ?? undefined,
    ).name;
  } catch {
    return (
      identity.profileDisplayName ??
      identity.firstName ??
      identity.userDisplayName ??
      identity.email?.split('@')[0] ??
      'User'
    );
  }
};

export const createSettingsCurrency = (currency: string): SettingsCurrencyViewModel =>
  createCurrencyOption(currency);

export const createSettingsLanguage = (
  language: string,
  fallbackNames: Record<string, string> = languageNames,
): SettingsLanguageViewModel =>
  LANGUAGES.find((item) => item.code === language) ?? {
    code: language,
    name: fallbackNames[language] ?? `Language (${language})`,
    flag: 'US',
  };
