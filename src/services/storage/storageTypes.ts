import {UserProfile} from '../../types/context-foundation';

export interface UserPreferences {
  themeColor?: string;
  currency?: string;
  language?: string;
  isDarkMode?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface AuthData {
  authMethod: string | null;
  email: string | null;
  phoneNumber: string | null;
}

export type CachedProfile = Omit<UserProfile, 'createdAt' | 'updatedAt' | 'dateOfBirth'> & {
  createdAt: string;
  updatedAt: string;
  dateOfBirth?: string | null;
};

export interface RecurringMetadata {
  lastRecurringTaskRun?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PaginatedStorageResult<T> {
  data: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
