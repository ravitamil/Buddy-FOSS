/**
 * Authentication types for Google Sign-In and Unified implementation
 */

import {User} from './context-foundation';

export interface GoogleUser {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
  dateOfBirth?: string | null;
}

export type AppUser = User;

export interface GoogleSignInResult {
  type: 'success' | 'cancelled';
  user?: GoogleUser;
  idToken?: string;
  accessToken?: string;
}

export interface AuthResult {
  type: 'success' | 'cancelled' | 'error';
  user?: User;
  googleUser?: GoogleUser;
  error?: AuthError;
  isNewUser?: boolean;
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GoogleUser | null;
  authUser: User | null;
  tokens: AuthTokens | null;
  error: string | null;
  isGoogleLinked: boolean;
  /** True after the first Auth state listener event resolves */
  authListenerResolved?: boolean;
}

export interface GoogleAuthContextType {
  // State
  authState: AuthState;

  // Actions
  signIn: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  linkWithGoogle: () => Promise<AuthResult>;
  unlinkGoogle: () => Promise<boolean>;
  refreshTokens: () => Promise<boolean>;
  clearError: () => void;

  // Utilities
  isTokenValid: () => boolean;
  getUserProfile: () => GoogleUser | null;
  getAuthUser: () => User | null;
  getAuthToken: (forceRefresh?: boolean) => Promise<string | null>;
}

export interface GoogleSignInConfig {
  webClientId: string;
  iosClientId?: string;
  androidClientId?: string;
  scopes?: string[];
  offlineAccess?: boolean;
  hostedDomain?: string;
  forceCodeForRefreshToken?: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

// Platform-specific types
export interface WebGoogleSignInConfig {
  client_id: string;
  callback: (response: unknown) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

export interface NativeGoogleSignInConfig {
  webClientId: string;
  offlineAccess: boolean;
  hostedDomain?: string;
  forceCodeForRefreshToken?: boolean;
  accountName?: string;
  iosClientId?: string;
  googleServicePlistPath?: string;
  openIdConnect?: boolean;
  profileImageSize?: number;
}

// Hook return types
export interface UseGoogleAuthReturn {
  authState: AuthState;
  signIn: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  linkWithGoogle: () => Promise<AuthResult>;
  unlinkGoogle: () => Promise<boolean>;
  refreshTokens: () => Promise<boolean>;
  clearError: () => void;
  isTokenValid: () => boolean;
  getAuthUser: () => User | null;
  getAuthToken: (forceRefresh?: boolean) => Promise<string | null>;
}

export interface UseGoogleSignInReturn {
  signIn: () => Promise<AuthResult>;
  isLoading: boolean;
  error: string | null;
}

export interface UnifiedAuthConfig {
  google: GoogleSignInConfig;
}
