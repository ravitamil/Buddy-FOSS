import type React from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface NotificationSettings {
  subscriptionReminders: boolean;
  loanReminders: boolean;
  reminderDaysBefore: number;
  dailyReminderTime: string;
  overdueReminders: boolean;
  successNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

export interface SettingsContextType {
  currency: string;
  groupCurrency: string;
  language: string;
  theme: ThemeMode;
  notifications: NotificationSettings;
  settlementStrategy: 'pairwise' | 'minimize_transactions';
  updateCurrency: (currency: string) => Promise<void>;
  updateGroupCurrency: (currency: string) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  updateTheme: (theme: ThemeMode) => Promise<void>;
  updateNotifications: (settings: Partial<NotificationSettings>) => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatCurrencyExact: (amount: number) => string;
  formatDate: (date: Date, format?: 'short' | 'long' | 'relative') => string;
  syncWithRemote: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;
  isInitialized: boolean;
}

export interface SettingsProviderProps {
  children: React.ReactNode;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  subscriptionReminders: true,
  loanReminders: true,
  reminderDaysBefore: 1,
  dailyReminderTime: '09:00',
  overdueReminders: true,
  successNotifications: true,
  pushNotifications: true,
  emailNotifications: false,
};

export const SETTINGS_STORAGE_KEYS = {
  CURRENCY: '@BuddyApp:currency',
  GROUP_CURRENCY: '@BuddyApp:group_currency',
  LANGUAGE: '@BuddyApp:language',
  THEME: '@BuddyApp:theme',
  NOTIFICATIONS: '@BuddyApp:notifications',
  LAST_SYNC: '@BuddyApp:settings_last_sync',
  SETTLEMENT_STRATEGY: '@BuddyApp:settlement_strategy',
} as const;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const parseJson = (value: string): unknown => JSON.parse(value) as unknown;
