/**
 * Authentication Configuration
 * Centralized configuration for Google Sign-In
 */

import {Platform} from 'react-native';
import Constants from 'expo-constants';
import {GoogleSignInConfig, UnifiedAuthConfig} from '../types/auth.types';
import {logger as appLogger} from '../services/LoggerService';

const logger = appLogger.contextLogger('AuthConfig');

// Environment variables interface
interface AuthEnvironment {
  GOOGLE_WEB_CLIENT_ID?: string;
  GOOGLE_IOS_CLIENT_ID?: string;
  GOOGLE_ANDROID_CLIENT_ID?: string;
}

function getExtraString(key: string): string | undefined {
  const extra: unknown = Constants.expoConfig?.extra;
  if (typeof extra !== 'object' || extra === null) {
    return undefined;
  }

  const value = (extra as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

function getEnvString(key: string): string | undefined {
  const env = process.env as Record<string, string | undefined>;
  return env[key];
}

// Get environment variables
const env: AuthEnvironment = {
  GOOGLE_WEB_CLIENT_ID:
    getExtraString('googleWebClientId') || getEnvString('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
  GOOGLE_IOS_CLIENT_ID:
    getExtraString('googleIosClientId') || getEnvString('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
  GOOGLE_ANDROID_CLIENT_ID:
    getExtraString('googleAndroidClientId') || getEnvString('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'),
};

// Validation function
function validateConfig(): void {
  const requiredVars: (keyof AuthEnvironment)[] = ['GOOGLE_WEB_CLIENT_ID'];

  if (Platform.OS === 'ios') {
    requiredVars.push('GOOGLE_IOS_CLIENT_ID');
  }

  if (Platform.OS === 'android') {
    requiredVars.push('GOOGLE_ANDROID_CLIENT_ID');
  }

  const missingVars = requiredVars.filter((varName) => !env[varName]);

  if (missingVars.length > 0) {
    logger.warn(
      `Missing Google Sign-In configuration for: ${missingVars.join(', ')}. ` +
        'Please check your environment variables or app.config.js',
    );
  }
}

// Validate configuration on import
validateConfig();

// Google Sign-In configuration
const googleConfig: GoogleSignInConfig = {
  webClientId: env.GOOGLE_WEB_CLIENT_ID || '',
  iosClientId: env.GOOGLE_IOS_CLIENT_ID,
  androidClientId: env.GOOGLE_ANDROID_CLIENT_ID,
  scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/user.birthday.read'],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
};

// Unified authentication configuration
export const googleSignInConfig: UnifiedAuthConfig = {
  google: googleConfig,
};

// Platform-specific client ID getter
export function getClientId(): string {
  switch (Platform.OS) {
    case 'ios':
      return env.GOOGLE_IOS_CLIENT_ID || env.GOOGLE_WEB_CLIENT_ID || '';
    case 'android':
      return env.GOOGLE_ANDROID_CLIENT_ID || env.GOOGLE_WEB_CLIENT_ID || '';
    case 'web':
      return env.GOOGLE_WEB_CLIENT_ID || '';
    default:
      return env.GOOGLE_WEB_CLIENT_ID || '';
  }
}

// Check if configuration is valid
export function isConfigurationValid(): boolean {
  const clientId = getClientId();
  return !!clientId && clientId.length > 0;
}

// Development configuration (for testing)
export const developmentConfig = {
  // These are placeholder values - replace with actual client IDs
  GOOGLE_WEB_CLIENT_ID: 'your-web-client-id.googleusercontent.com',
  GOOGLE_IOS_CLIENT_ID: 'your-ios-client-id.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID: 'your-android-client-id.googleusercontent.com',
};

// Configuration status
export function getConfigurationStatus(): {
  isValid: boolean;
  platform: string;
  clientId: string;
  missingVars: string[];
} {
  const clientId = getClientId();
  const isValid = isConfigurationValid();

  const requiredVars: string[] = ['GOOGLE_WEB_CLIENT_ID'];
  if (Platform.OS === 'ios') requiredVars.push('GOOGLE_IOS_CLIENT_ID');
  if (Platform.OS === 'android') requiredVars.push('GOOGLE_ANDROID_CLIENT_ID');

  const missingVars = requiredVars.filter((varName) => {
    const key = varName as keyof AuthEnvironment;
    return !env[key];
  });

  return {
    isValid,
    platform: Platform.OS,
    clientId: clientId ? `${clientId.substring(0, 20)}...` : 'Not configured',
    missingVars,
  };
}

export default googleSignInConfig;
