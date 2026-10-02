/**
 * Unified Authentication Service
 * Combines Google Sign-In with Supabase Authentication
 * Provides a single interface for all authentication operations
 */

import {UnifiedAuthConfig, AuthResult, AuthError, GoogleUser} from '../types/auth.types';
import {User} from '../types/context-foundation';
import GoogleSignInService from './GoogleSignInService';
import {SupabaseAuthService} from './SupabaseAuthService';
import {logger as appLogger} from './LoggerService';
import {assertCachedFeatureActionAllowed} from '@/features/featureControls/runtime';

import {wipeAllLocalData} from '../utils/dataWiper';

// Create service-specific logger
const logger = appLogger.serviceLogger('UnifiedAuthService');

class UnifiedAuthError extends Error implements AuthError {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'UnifiedAuthError';
  }
}

export type UnifiedAuthResult = AuthResult;

export interface AuthProvider {
  id: string;
  providerId: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

export class UnifiedAuthService {
  private static instance: UnifiedAuthService;
  private googleSignInService: GoogleSignInService;
  private supabaseAuthService: SupabaseAuthService;
  private currentUser: User | null = null;
  private isConfigured = false;
  private configurationPromise: Promise<void> | null = null;

  private constructor() {
    this.googleSignInService = GoogleSignInService.getInstance();
    this.supabaseAuthService = SupabaseAuthService.getInstance();
  }

  public static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService.instance;
  }

  /**
   * Configure the unified authentication service
   */
  public async configure(config: UnifiedAuthConfig): Promise<void> {
    if (this.isConfigured) return;
    if (this.configurationPromise) return this.configurationPromise;

    this.configurationPromise = this.configureServices(config);

    try {
      await this.configurationPromise;
    } finally {
      this.configurationPromise = null;
    }
  }

  private async configureServices(config: UnifiedAuthConfig): Promise<void> {
    try {
      await this.googleSignInService.configure(config.google);
      this.isConfigured = true;
    } catch (error) {
      logger.error('Failed to configure unified auth service', error);
      throw this.createThrowableAuthError(
        'CONFIGURATION_ERROR',
        'Failed to configure authentication',
        error,
      );
    }
  }

  private lastGoogleUser: GoogleUser | null = null;

  public getLastGoogleUser(): GoogleUser | null {
    return this.lastGoogleUser;
  }

  /**
   * Sign in with Google and Supabase
   */
  public async signInWithGoogle(): Promise<UnifiedAuthResult> {
    if (this.configurationPromise) {
      await this.configurationPromise;
    }

    if (!this.isConfigured) {
      throw this.createThrowableAuthError(
        'NOT_CONFIGURED',
        'Authentication service not configured',
      );
    }

    try {
      // 1. Sign in with Google (Native/Web)
      const googleResult = await this.googleSignInService.signIn();

      if (googleResult.type !== 'success' || !googleResult.idToken) {
        return {type: googleResult.type, error: undefined};
      }

      // 2. Sign in with Supabase using ID token
      const user = await this.supabaseAuthService.signInWithGoogle(googleResult.idToken);

      if (googleResult.user) {
        this.lastGoogleUser = googleResult.user;
        if (!user.photoURL && googleResult.user.photo) {
          user.photoURL = googleResult.user.photo;
        }
        if (!user.dateOfBirth && googleResult.user.dateOfBirth) {
          const parsed = new Date(googleResult.user.dateOfBirth);
          if (!isNaN(parsed.getTime())) {
            user.dateOfBirth = parsed;
          }
        }
      }

      this.currentUser = user; // Update local cache

      return {
        type: 'success',
        user: user,
        googleUser: googleResult.user,
        isNewUser: user.createdAt.getTime() === user.lastSignInAt.getTime(), // Approximation
      };
    } catch (error) {
      logger.error('Unified Google Sign-In failed', error);
      return {
        type: 'error',
        error: this.createAuthError('SIGNIN_ERROR', 'Failed to sign in with Google', error),
      };
    }
  }

  /**
   * Sign in anonymously
   */
  public async signInAnonymously(captchaToken?: string): Promise<UnifiedAuthResult> {
    try {
      const user = await this.supabaseAuthService.signInAnonymously(captchaToken);
      this.currentUser = user; // Update local cache

      return {
        type: 'success',
        user: user,
        isNewUser: true, // Anonymous users are effectively new sessions
      };
    } catch (error) {
      logger.error('Unified Anonymous Sign-In failed', error);
      return {
        type: 'error',
        error: this.createAuthError('SIGNIN_ERROR', 'Failed to sign in anonymously', error),
      };
    }
  }

  /**
   * Link Google account - Not directly supported in Supabase client the same way as Firebase
   * For now, we'll treat it as Sign In (which links if email matches)
   */
  public async linkWithGoogle(): Promise<UnifiedAuthResult> {
    return this.signInWithGoogle();
  }

  /**
   * Unlink Google provider - Not easily supported in Supabase client side
   */
  public unlinkGoogle(): boolean {
    logger.warn('unlinkGoogle is not yet implemented for Supabase');
    return false;
  }

  /**
   * Sign out from all services
   */
  public async signOut(): Promise<void> {
    logger.info('Starting sign out process');
    const userId = this.currentUser?.uid;
    this.currentUser = null; // Clear local cache immediately

    try {
      await Promise.allSettled([
        this.supabaseAuthService.signOut(),
        this.googleSignInService.signOut(),
        wipeAllLocalData(userId),
        this.clearCache(),
      ]);
      logger.info('Sign out completed successfully');
    } catch (error) {
      logger.error('Sign out failed', error);
      throw this.createThrowableAuthError('SIGNOUT_ERROR', 'Failed to sign out', error);
    }
  }

  /**
   * Get current User (Async)
   */
  public async getCurrentUser(): Promise<User | null> {
    const user = await this.supabaseAuthService.getCurrentUser();
    this.currentUser = user; // Update local cache
    return user;
  }

  /**
   * Get current User (Synchronous)
   * Returns the last known user state
   */
  public getCurrentUserSync(): User | null {
    return this.currentUser;
  }

  /**
   * Check if Google provider is linked
   * Supabase user metadata might contain this info
   */
  public async isGoogleLinked(): Promise<boolean> {
    return this.supabaseAuthService.isProviderLinked('google');
  }

  /**
   * Get Session Token
   */
  public async getSessionToken(): Promise<string | null> {
    const session = await this.supabaseAuthService.getSession();
    return session?.access_token || null;
  }

  /**
   * Get Google access tokens
   */
  public async getGoogleTokens(): Promise<{accessToken: string; idToken?: string} | null> {
    try {
      const tokens = await this.googleSignInService.getTokens();
      if (!tokens || !tokens.accessToken) {
        throw new Error('No access token received');
      }
      return tokens as {accessToken: string; idToken?: string};
    } catch (error) {
      logger.error('Failed to get Google tokens', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * This is async now!
   */
  public async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  /**
   * Check if user is anonymous
   */
  public async isAnonymous(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.isAnonymous ?? false;
  }

  /**
   * Check if a specific provider is linked
   */
  public async isProviderLinked(providerId: string): Promise<boolean> {
    return this.supabaseAuthService.isProviderLinked(providerId);
  }

  /**
   * Link current user with Google
   * Note: Supabase doesn't support direct account linking from client side easily
   * The standard way is to sign in with the new provider, which auto-links if emails match
   */
  public async linkWithGoogleIdToken(idToken: string): Promise<User> {
    // For Supabase, signing in with an existing email/provider will link accounts
    // if the email is confirmed.
    const user = await this.supabaseAuthService.signInWithGoogle(idToken);
    this.currentUser = user;
    return user;
  }

  /**
   * Send email verification - Managed by Supabase
   */
  public sendEmailVerification(): void {
    // Supabase handles this automatically usually
    logger.warn('sendEmailVerification not implemented manually for Supabase');
  }

  /**
   * Update user profile
   */
  /**
   * Update user profile (Auth Metadata)
   */
  public async updateProfile(profile: {displayName?: string; photoURL?: string}): Promise<void> {
    await this.supabaseAuthService.updateUser(profile);
    // Also refresh local user
    this.currentUser = await this.supabaseAuthService.getCurrentUser();
  }

  /**
   * Delete current user account
   * Calls the Supabase Edge Function to delete storage files and the auth user.
   * CASCADE foreign keys handle all public table data cleanup.
   */
  public async deleteAccount(): Promise<void> {
    logger.info('Starting account deletion process');
    const userId = this.currentUser?.uid;

    try {
      // 1. Delete the account via Edge Function (handles storage + auth user + CASCADE data)
      await this.supabaseAuthService.deleteAccount();

      // 2. Sign out from everything to clear local session state
      try {
        await this.supabaseAuthService.signOut();
      } catch (signOutError) {
        logger.warn('Supabase sign out during deletion failed (non-fatal)', signOutError);
      }

      try {
        await this.googleSignInService.signOut();
      } catch (googleError) {
        logger.warn('Google sign out during deletion failed (non-fatal)', googleError);
      }

      // 3. WIPE ALL LOCAL DATA
      await wipeAllLocalData(userId);

      // 4. Clear memory cache
      this.currentUser = null;

      logger.info('Account deletion completed successfully');
    } catch (error) {
      logger.error('Account deletion failed', error);
      throw this.createThrowableAuthError(
        'DELETE_ACCOUNT_ERROR',
        'Failed to delete account',
        error,
      );
    }
  }

  // ============================================================================
  // Email Authentication Methods (Supabase Delegates)
  // ============================================================================

  /**
   * Sign In with Email
   * Sends OTP
   */
  public async signInWithEmail(email: string): Promise<{verificationId: string}> {
    await assertCachedFeatureActionAllowed('auth.emailSignIn');
    return this.supabaseAuthService.signInWithEmail(email);
  }

  /**
   * Verify Email OTP
   * Completes Sign In
   */
  public async verifyEmailOtp(email: string, token: string): Promise<User> {
    await assertCachedFeatureActionAllowed('auth.verifyEmailOtp');
    const user = await this.supabaseAuthService.verifyEmailOtp(email, token);
    this.currentUser = user;
    return user;
  }

  /**
   * Resend Email OTP
   */
  public async resendEmailOtp(email: string): Promise<void> {
    await assertCachedFeatureActionAllowed('auth.resendEmailOtp');
    return this.supabaseAuthService.resendEmailOtp(email);
  }

  /**
   * Set session directly from tokens
   */
  public async setSession(tokens: {access_token: string; refresh_token: string}): Promise<User> {
    const user = await this.supabaseAuthService.setSession(tokens);
    this.currentUser = user;
    return user;
  }

  /**
   * Handle incoming auth deep link URL
   */
  public async handleAuthUrl(url: string): Promise<User | null> {
    const user = await this.supabaseAuthService.handleAuthUrl(url);
    if (user) {
      this.currentUser = user;
    }
    return user;
  }

  // ============================================================================
  // Phone Authentication Methods (disabled by feature controls by default)
  // ============================================================================

  /**
   * Sign In with Phone Number
   * Sends OTP
   */
  public async signInWithPhoneNumber(phoneNumber: string): Promise<{verificationId: string}> {
    await assertCachedFeatureActionAllowed('auth.phoneSignIn');
    return this.supabaseAuthService.signInWithPhone(phoneNumber);
  }

  /**
   * Verify Phone OTP
   * Completes Sign In
   */
  public async verifyOtp(phoneNumber: string, token: string): Promise<User> {
    await assertCachedFeatureActionAllowed('auth.verifyPhoneOtp');
    const user = await this.supabaseAuthService.verifyPhoneOtp(phoneNumber, token);
    this.currentUser = user;
    return user;
  }

  /**
   * Resend Phone OTP
   */
  public async resendOtp(phoneNumber: string): Promise<void> {
    await assertCachedFeatureActionAllowed('auth.resendPhoneOtp');
    return this.supabaseAuthService.resendOtp(phoneNumber);
  }

  /**
   * Listen to auth state changes
   */
  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.supabaseAuthService.onAuthStateChanged((user) => {
      this.currentUser = user; // Update local cache
      callback(user);
    });
  }

  /**
   * Clear cached authentication data
   */
  public async clearCache(): Promise<void> {
    try {
      await this.googleSignInService.clearCachedSignIn();
    } catch (error) {
      logger.error('Failed to clear auth cache', error);
    }
  }

  /**
   * Create standardized auth error
   */
  private createAuthError(code: string, message: string, details?: unknown): AuthError {
    return new UnifiedAuthError(code, message, details);
  }

  private createThrowableAuthError(
    code: string,
    message: string,
    details?: unknown,
  ): UnifiedAuthError {
    return new UnifiedAuthError(code, message, details);
  }
}

export default UnifiedAuthService.getInstance();
