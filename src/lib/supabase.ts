import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

type PublicEnvKey = 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_ANON_KEY';

const getPublicEnvValue = (key: PublicEnvKey): string => {
  const env: unknown = process.env;

  if (typeof env !== 'object' || env === null) {
    return '';
  }

  const value = (env as Record<PublicEnvKey, unknown>)[key];
  return typeof value === 'string' ? value : '';
};

const supabaseUrl = getPublicEnvValue('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getPublicEnvValue('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// Custom storage adapter for React Native using AsyncStorage
// SecureStore has a 2048 byte limit on iOS which can be exceeded by Supabase sessions
const AsyncStorageAdapter = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key);
  },
};

// Use localStorage for web, AsyncStorage for native
const storage = Platform.OS === 'web' ? localStorage : AsyncStorageAdapter;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
