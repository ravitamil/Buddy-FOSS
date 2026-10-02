/**
 * Google Sign-In Service
 * Handles authentication logic for both native and web platforms
 */

import {Platform} from 'react-native';
import {AuthRequest, makeRedirectUri, ResponseType} from 'expo-auth-session';
// Native Google Credential Manager disabled for degoogled FOSS build
interface CredentialManagerResult {
  type: 'success' | 'cancelled';
  idToken?: string;
  user?: {
    id?: string;
    email?: string;
    displayName?: string;
    photoUrl?: string;
    familyName?: string;
    givenName?: string;
  };
}
const isCredentialManagerSupported = () => false;
const signInWithCredentialManager = (_options?: unknown): Promise<CredentialManagerResult> =>
  Promise.resolve({type: 'cancelled'});
const signOutWithCredentialManager = (): Promise<void> => Promise.resolve();
import appLogger from './LoggerService';
import {GoogleUser, GoogleSignInResult, GoogleSignInConfig, AuthError} from '../types/auth.types';

// Alias exported logger instance to match existing call sites

interface GoogleBrowserApi {
  accounts?: {
    id?: {
      disableAutoSelect?: () => void;
    };
  };
}

class GoogleAuthServiceError extends Error implements AuthError {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'GoogleAuthServiceError';
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('code' in error)) return undefined;
  const code = (error as {code?: unknown}).code;
  return typeof code === 'string' ? code : undefined;
}

function asThrowable(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function getGoogleBrowserApi(): GoogleBrowserApi | undefined {
  if (typeof window === 'undefined') return undefined;
  const maybeWindow = window as Window & {google?: GoogleBrowserApi};
  return maybeWindow.google;
}

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function decodeBase64(input: string): string {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(input);
  }
  const str = input.replace(/=+$/, '');
  let output = '';
  for (let bc = 0, bs = 0, buffer: number, idx = 0; (buffer = str.charCodeAt(idx++)); ) {
    const charIndex = B64_CHARS.indexOf(String.fromCharCode(buffer));
    if (~charIndex) {
      bs = bc % 4 ? bs * 64 + charIndex : charIndex;
      if (bc++ % 4) {
        output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
      }
    }
  }
  return output;
}

export interface JwtClaims {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  family_name?: string;
  given_name?: string;
  birthdate?: string;
  birthday?: string;
  date_of_birth?: string;
}

export function decodeJwtClaims(jwtToken: string): JwtClaims | null {
  try {
    const parts = jwtToken.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = decodeBase64(base64);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

interface GooglePeopleBirthdayItem {
  date?: {
    year?: number;
    month?: number;
    day?: number;
  };
}

interface GooglePeopleResponse {
  birthdays?: GooglePeopleBirthdayItem[];
}

export async function fetchGooglePeopleBirthday(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=birthdays,photos',
      {
        headers: {Authorization: `Bearer ${accessToken}`},
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as GooglePeopleResponse;
    const bday = data.birthdays?.find((b) => b.date?.year && b.date?.month && b.date?.day)?.date;
    if (bday?.year && bday.month && bday.day) {
      return `${bday.year}-${String(bday.month).padStart(2, '0')}-${String(bday.day).padStart(2, '0')}`;
    }
    return null;
  } catch (error) {
    appLogger.debug('Could not fetch Google People API birthday', error);
    return null;
  }
}

class GoogleSignInService {
  private static instance: GoogleSignInService;
  private isConfigured = false;
  private config: GoogleSignInConfig | null = null;
  // Cache tokens for web flow
  private webTokens: {idToken?: string; accessToken?: string} | null = null;

  private constructor() {}

  public static getInstance(): GoogleSignInService {
    if (!GoogleSignInService.instance) {
      GoogleSignInService.instance = new GoogleSignInService();
    }
    return GoogleSignInService.instance;
  }

  /**
   * Configure Google Sign-In with platform-specific settings
   */
  public configure(config: GoogleSignInConfig): Promise<void> {
    try {
      this.config = config;

      if (Platform.OS === 'web') {
        this.configureWeb(config);
      } else {
        this.configureNative(config);
      }

      this.isConfigured = true;
      return Promise.resolve();
    } catch (error) {
      appLogger.error('Failed to configure Google Sign-In:', error);
      throw this.createAuthError(
        'CONFIGURATION_ERROR',
        'Failed to configure Google Sign-In',
        error,
      );
    }
  }

  /**
   * Configure for native platforms (iOS/Android)
   */
  private configureNative(config: GoogleSignInConfig): void {
    if (!config?.webClientId) {
      appLogger.warn('Google Sign-In: webClientId is required for idToken');
    }
    appLogger.debug('Native Google Sign-In configured with Credential Manager');
  }

  /**
   * Configure for web platform
   */
  private configureWeb(config: GoogleSignInConfig): void {
    // Expo Auth Session uses window location redirects/popups; nothing else to configure here
    if (!config?.webClientId) {
      appLogger.warn('Expo Auth Session: Missing GOOGLE_WEB_CLIENT_ID for web sign-in');
    }
  }

  /**
   * Sign in with Google
   */
  public async signIn(): Promise<GoogleSignInResult> {
    if (!this.isConfigured) {
      throw this.createAuthError('NOT_CONFIGURED', 'Google Sign-In not configured');
    }

    try {
      if (Platform.OS === 'web') {
        return await this.signInWeb();
      } else {
        return await this.signInNative();
      }
    } catch (error) {
      const errorCode = getErrorCode(error);
      if (errorCode === 'SIGN_IN_CANCELLED' || errorCode === 'ACTIVITY_NOT_FOUND') {
        return {type: 'cancelled'};
      }
      appLogger.error('Google Sign-In failed:', error);
      return this.handleSignInError(error);
    }
  }

  /**
   * Native sign-in implementation using Android Credential Manager
   */
  private async signInNative(): Promise<GoogleSignInResult> {
    if (Platform.OS !== 'android') {
      throw this.createAuthError(
        'PLATFORM_NOT_SUPPORTED',
        'Native Google Sign-In is only supported on Android via Credential Manager',
      );
    }

    if (!this.config?.webClientId) {
      throw this.createAuthError('INVALID_CONFIG', 'webClientId is missing for Google Sign-In');
    }

    const supported = isCredentialManagerSupported();
    if (!supported) {
      throw this.createAuthError(
        'NOT_SUPPORTED',
        'Google Credential Manager is not supported on this device',
      );
    }

    try {
      appLogger.debug('Initiating Android Credential Manager sign-in');
      const cmResult = await signInWithCredentialManager({
        serverClientId: this.config.webClientId,
        autoSelectEnabled: false,
        filterByAuthorizedAccounts: false,
      });

      if (cmResult.type === 'success' && cmResult.idToken && cmResult.user) {
        this.webTokens = {
          idToken: cmResult.idToken,
        };

        const claims = decodeJwtClaims(cmResult.idToken);
        const photo = cmResult.user.photoUrl || claims?.picture || null;
        const dateOfBirth = claims?.birthdate || claims?.birthday || claims?.date_of_birth || null;

        const user: GoogleUser = {
          id: cmResult.user.id || claims?.sub || '',
          email: cmResult.user.email || claims?.email || '',
          name: cmResult.user.displayName || claims?.name || null,
          photo,
          familyName: cmResult.user.familyName || claims?.family_name || null,
          givenName: cmResult.user.givenName || claims?.given_name || null,
          dateOfBirth,
        };

        return {type: 'success', user, idToken: cmResult.idToken};
      }

      // User cancelled or dismissed picker
      return {type: 'cancelled'};
    } catch (error) {
      const errorCode = getErrorCode(error);
      if (errorCode === 'CREDENTIAL_MANAGER_ERROR' || errorCode === 'ACTIVITY_NOT_FOUND') {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('cancel') || errorMsg.includes('16')) {
          return {type: 'cancelled'};
        }
      }
      throw asThrowable(error);
    }
  }

  /**
   * Web sign-in implementation
   */
  private async signInWeb(): Promise<GoogleSignInResult> {
    if (!this.config) {
      throw this.createAuthError('NOT_CONFIGURED', 'Google Sign-In not configured');
    }
    if (typeof window === 'undefined') {
      throw this.createAuthError('WEB_NOT_SUPPORTED', 'Google Sign-In not available on web');
    }

    const redirectUri = makeRedirectUri({scheme: 'buddy'});
    const scopes = this.config.scopes || [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/user.birthday.read',
    ];

    const request = new AuthRequest({
      clientId: this.config.webClientId,
      scopes,
      redirectUri,
      responseType: ResponseType.IdToken,
      extraParams: {prompt: 'select_account'},
    });

    await request.makeAuthUrlAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (result.type !== 'success' || !result.params?.id_token) {
      return {type: 'cancelled'};
    }

    const idToken = result.params.id_token;
    this.webTokens = {idToken};

    const claims = decodeJwtClaims(idToken);
    const user: GoogleUser | undefined = claims
      ? {
          id: claims.sub || '',
          email: claims.email || '',
          name: claims.name || null,
          photo: claims.picture || null,
          familyName: claims.family_name || null,
          givenName: claims.given_name || null,
          dateOfBirth: claims.birthdate || claims.birthday || claims.date_of_birth || null,
        }
      : undefined;

    return {type: 'success', user, idToken};
  }

  /**
   * Sign out from Google
   */
  public async signOut(): Promise<void> {
    try {
      this.webTokens = null;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          getGoogleBrowserApi()?.accounts?.id?.disableAutoSelect?.();
        }
      } else if (Platform.OS === 'android') {
        await signOutWithCredentialManager();
      }
    } catch (error) {
      // Avoid throwing to prevent noisy console errors during sign-out
      appLogger.warn('Google Sign-Out encountered an error; proceeding with app sign-out', error);
    }
  }

  /**
   * Get current user info
   */
  public getCurrentUser(): Promise<GoogleUser | null> {
    // Current user state is managed via Supabase auth session
    return Promise.resolve(null);
  }

  /**
   * Check if user is signed in by attempting to get current user
   */
  public isSignedIn(): Promise<boolean> {
    return Promise.resolve(!!this.webTokens?.idToken);
  }

  /**
   * Get access tokens
   */
  public getTokens(): Promise<{accessToken?: string; idToken?: string} | null> {
    return Promise.resolve(this.webTokens ?? null);
  }

  /**
   * Handle sign-in errors
   */
  private handleSignInError(error: unknown): GoogleSignInResult {
    const errorCode = getErrorCode(error);
    if (errorCode === 'SIGN_IN_CANCELLED') {
      return {type: 'cancelled'};
    }

    // For other errors, we might want to throw or return an error result
    throw this.createAuthError('SIGN_IN_ERROR', 'Sign-in failed', error);
  }

  /**
   * Create standardized auth error
   */
  private createAuthError(
    code: string,
    message: string,
    details?: unknown,
  ): GoogleAuthServiceError {
    return new GoogleAuthServiceError(code, message, details);
  }

  /**
   * Clear cached sign-in data
   */
  public async clearCachedSignIn(): Promise<void> {
    await this.signOut();
  }
}

export default GoogleSignInService;
