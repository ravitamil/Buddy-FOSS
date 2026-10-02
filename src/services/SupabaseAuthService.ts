import * as Linking from 'expo-linking';
import {supabase} from '../lib/supabase';
import {User} from '../types/context-foundation';
import {AuthError} from '../types/auth.types';
import type {Session, User as SupabaseUser, UserAttributes} from '@supabase/supabase-js';
import {logger as appLogger} from './LoggerService';

const logger = appLogger.contextLogger('SupabaseAuthService');

class SupabaseAuthServiceError extends Error implements AuthError {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'SupabaseAuthServiceError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getStringProperty = (value: unknown, key: string): string | null => {
  if (!isRecord(value)) return null;
  const property = value[key];
  return typeof property === 'string' ? property : null;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  const message = getStringProperty(error, 'message');
  return message ?? 'An unknown error occurred';
};

const getErrorCode = (error: unknown): string => {
  if (!isRecord(error)) return 'unknown';

  const status = error.status;
  if (typeof status === 'number' || typeof status === 'string') {
    return status.toString();
  }

  const code = error.code;
  if (typeof code === 'number' || typeof code === 'string') {
    return code.toString();
  }

  return 'unknown';
};

const parseResponseBody = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const readJsonResponse = async (response: Response): Promise<unknown> =>
  response.json() as Promise<unknown>;

const getEnvString = (key: string): string => getStringProperty(process.env, key) ?? '';

export class SupabaseAuthService {
  private static instance: SupabaseAuthService;

  private constructor() {}

  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  /**
   * Map Supabase User/Session to App User
   */
  private mapUser(user: SupabaseUser): User {
    const rawDob =
      getStringProperty(user.user_metadata, 'birthdate') ||
      getStringProperty(user.user_metadata, 'birthday') ||
      getStringProperty(user.user_metadata, 'date_of_birth') ||
      getStringProperty(user.user_metadata, 'dob');
    let parsedDob: Date | null = null;
    if (rawDob) {
      const parsed = new Date(rawDob);
      if (!isNaN(parsed.getTime())) {
        parsedDob = parsed;
      }
    }

    return {
      uid: user.id,
      email: user.email || null,
      phoneNumber: user.phone || null,
      displayName:
        getStringProperty(user.user_metadata, 'full_name') ||
        getStringProperty(user.user_metadata, 'name'),
      photoURL:
        getStringProperty(user.user_metadata, 'avatar_url') ||
        getStringProperty(user.user_metadata, 'picture'),
      emailVerified: !!user.email_confirmed_at,
      isAnonymous: user.is_anonymous || false,
      authProvider: getStringProperty(user.app_metadata, 'provider'),
      createdAt: new Date(user.created_at),
      lastSignInAt: new Date(user.last_sign_in_at || new Date()),
      dateOfBirth: parsedDob,
    };
  }

  /**
   * Authentication State Listener
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(this.mapUser(session.user));
      } else {
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }

  /**
   * Get Current User
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: {user},
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return this.mapUser(user);
  }

  /**
   * Sign In Anonymously
   */
  async signInAnonymously(captchaToken?: string): Promise<User> {
    try {
      const {data, error} = await supabase.auth.signInAnonymously({
        options: {
          captchaToken,
        },
      });

      if (error) throw this.formatError(error);
      if (!data.user) throw new Error('No user returned after anonymous sign in');

      return this.mapUser(data.user);
    } catch (error: unknown) {
      logger.error('Anonymous sign in failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Sign In with Email (OTP / Magic Link)
   */
  async signInWithEmail(email: string): Promise<{verificationId: string}> {
    const normalizedEmail = email.trim().toLowerCase();
    const emailRedirectTo = Linking.createURL('auth/callback');

    try {
      const {error} = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo,
        },
      });

      if (error) throw this.formatError(error);

      return {verificationId: normalizedEmail};
    } catch (error: unknown) {
      logger.error('Email sign in failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Verify Email OTP
   * Tries 'email' (magiclink/OTP) first, falls back to 'signup' (new registration confirmation)
   */
  async verifyEmailOtp(email: string, token: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();

    // First attempt: type 'email' (for existing accounts / magic links)
    const emailAttempt = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token,
      type: 'email',
    });

    if (!emailAttempt.error && emailAttempt.data.user) {
      return this.mapUser(emailAttempt.data.user);
    }

    // Second attempt: type 'signup' (for new/unconfirmed accounts)
    const signupAttempt = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token,
      type: 'signup',
    });

    if (!signupAttempt.error && signupAttempt.data.user) {
      return this.mapUser(signupAttempt.data.user);
    }

    // If both failed, format and throw error
    const error = signupAttempt.error || emailAttempt.error;
    logger.error('Email OTP verification failed', error);
    throw this.formatError(error);
  }

  /**
   * Resend Email OTP
   */
  async resendEmailOtp(email: string): Promise<void> {
    await this.signInWithEmail(email);
  }

  /**
   * Sign In with Phone (OTP)
   */
  async signInWithPhone(phoneNumber: string): Promise<{verificationId: string}> {
    try {
      const {error} = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw this.formatError(error);

      // Supabase doesn't use verificationId like Firebase, but returning one for interface compatibility
      // We can use the phone number itself as the identifier for the verify step
      return {verificationId: phoneNumber};
    } catch (error: unknown) {
      logger.error('Phone sign in failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Verify Phone OTP
   */
  async verifyPhoneOtp(phoneNumber: string, token: string): Promise<User> {
    try {
      const {data, error} = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });

      if (error) throw this.formatError(error);
      if (!data.user) throw new Error('No user returned after OTP verification');

      return this.mapUser(data.user);
    } catch (error: unknown) {
      logger.error('OTP verification failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Resend Phone OTP
   */
  async resendOtp(phoneNumber: string): Promise<void> {
    try {
      const {error} = await supabase.auth.resend({
        type: 'sms',
        phone: phoneNumber,
      });

      if (error) throw this.formatError(error);
    } catch (error: unknown) {
      logger.error('Resend OTP failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Update User Attributes
   */
  async updateUser(attributes: {displayName?: string; photoURL?: string}): Promise<void> {
    try {
      const data: Record<string, string> = {};
      if (attributes.displayName) data.full_name = attributes.displayName;
      if (attributes.photoURL) data.avatar_url = attributes.photoURL;

      const updates: UserAttributes = Object.keys(data).length > 0 ? {data} : {};

      const {error} = await supabase.auth.updateUser(updates);

      if (error) throw this.formatError(error);
    } catch (error: unknown) {
      logger.error('Update user failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    try {
      const {error} = await supabase.auth.signOut();
      if (error) throw this.formatError(error);
    } catch (error: unknown) {
      logger.error('Sign out failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Delete account via Edge Function
   * The Edge Function uses the service role key to:
   * 1. Delete user storage files (avatars)
   * 2. Delete the auth user (CASCADE handles all public table data)
   */
  async deleteAccount(): Promise<void> {
    try {
      appLogger.debug('[SupabaseAuthService] deleteAccount initiated');

      // Debug: Get session explicitly
      const {
        data: {session},
        error: sessionError,
      } = await supabase.auth.getSession();

      appLogger.debug('[SupabaseAuthService] Session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        hasToken: !!session?.access_token,
        sessionError,
      });

      if (!session?.access_token) {
        throw new Error('No active session found. Please sign in again.');
      }

      appLogger.debug(
        '[SupabaseAuthService] Invoking delete-account Edge Function via Direct Fetch...',
      );

      // Construct URL manually to ensure it's correct
      // supabase.functions.getUrl() might be cleaner but let's be explicit
      const projectUrl = getEnvString('EXPO_PUBLIC_SUPABASE_URL');
      const functionUrl = `${projectUrl}/functions/v1/delete-account`;
      const anonKey = getEnvString('EXPO_PUBLIC_SUPABASE_ANON_KEY');

      appLogger.debug(`[SupabaseAuthService] Target URL: ${functionUrl}`);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          // Bypass Gateway 401 on User JWT by using Anon Key for "Transport Auth"
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.access_token, // Send actual User Token in body for manual verification
        }),
      });

      appLogger.debug(`[SupabaseAuthService] Response Status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        const errorDetails = parseResponseBody(text);

        appLogger.debug('[SupabaseAuthService] Error Details:', errorDetails);

        if (response.status === 401) {
          throw new Error('Unauthorized: Please sign in again. (Check Edge Function Logs)');
        }
        throw new Error(
          `Edge Function error (${response.status}): ${JSON.stringify(errorDetails)}`,
        );
      }

      const data = await readJsonResponse(response);
      appLogger.debug('[SupabaseAuthService] deleteAccount success:', data);
    } catch (error: unknown) {
      appLogger.error('[SupabaseAuthService] deleteAccount caught error:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Link Anonymous Account with Phone
   */
  async linkWithPhone(phoneNumber: string): Promise<{verificationId: string}> {
    try {
      const {error} = await supabase.auth.updateUser({
        phone: phoneNumber,
      });

      if (error) throw this.formatError(error);
      return {verificationId: phoneNumber};
    } catch (error: unknown) {
      logger.error('Link with phone failed', error);
      throw this.formatError(error);
    }
  }

  async signInWithGoogle(idToken: string): Promise<User> {
    try {
      const {data, error} = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw this.formatError(error);
      if (!data.user) throw new Error('No user returned after Google sign in');

      return this.mapUser(data.user);
    } catch (error: unknown) {
      logger.error('Google sign in failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Get Current Session
   */
  async getSession(): Promise<Session | null> {
    const {
      data: {session},
      error,
    } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  }

  /**
   * Check if a provider is linked to the current user
   */
  async isProviderLinked(providerId: string): Promise<boolean> {
    const {
      data: {user},
    } = await supabase.auth.getUser();
    if (!user || !user.identities) return false;

    return user.identities.some((identity) => identity.provider === providerId);
  }

  /**
   * Set Session from Tokens
   */
  async setSession(tokens: {access_token: string; refresh_token: string}): Promise<User> {
    try {
      const {data, error} = await supabase.auth.setSession(tokens);
      if (error) throw this.formatError(error);
      if (!data.user) throw new Error('No user returned after setting session');
      return this.mapUser(data.user);
    } catch (error: unknown) {
      logger.error('Setting session failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Exchange Code for Session (PKCE)
   */
  async exchangeCodeForSession(code: string): Promise<User> {
    try {
      const {data, error} = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw this.formatError(error);
      if (!data.user) throw new Error('No user returned after exchanging code for session');
      return this.mapUser(data.user);
    } catch (error: unknown) {
      logger.error('Exchanging code for session failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Handle incoming auth deep link URL
   */
  async handleAuthUrl(url: string): Promise<User | null> {
    try {
      if (!url) return null;

      const hashIndex = url.indexOf('#');
      const queryIndex = url.indexOf('?');

      const parseParams = (paramString: string): Record<string, string> => {
        const result: Record<string, string> = {};
        const pairs = paramString.split('&');
        for (const pair of pairs) {
          const [key, value] = pair.split('=');
          if (key && value) {
            result[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        }
        return result;
      };

      const queryParams =
        queryIndex !== -1 ? parseParams(url.substring(queryIndex + 1).split('#')[0]) : {};
      const hashParams = hashIndex !== -1 ? parseParams(url.substring(hashIndex + 1)) : {};
      const params = {...queryParams, ...hashParams};

      const error = params.error;
      const errorDescription = params.error_description;
      if (error) {
        throw new Error(errorDescription || error);
      }

      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;
      if (accessToken && refreshToken) {
        return await this.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }

      const code = params.code;
      if (code) {
        return await this.exchangeCodeForSession(code);
      }

      return null;
    } catch (error: unknown) {
      logger.error('Handling auth URL failed', error);
      throw this.formatError(error);
    }
  }

  /**
   * Error Formatting
   */
  private formatError(error: unknown): SupabaseAuthServiceError {
    if (error instanceof SupabaseAuthServiceError) {
      return error;
    }

    return new SupabaseAuthServiceError(
      getErrorCode(error),
      getErrorMessage(error),
      error instanceof Error ? {name: error.name, stack: error.stack} : error,
    );
  }
}
