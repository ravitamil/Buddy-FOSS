/**
 * AuthContext
 *
 * Consolidates authentication management.
 * Implements standardized error handling, state management, and memoization.
 *
 * Features:
 * - Authentication state management
 * - Standardized error handling
 * - Memoized context values for performance
 * - Session persistence and restoration
 */

import React, {createContext, useContext, useReducer, useEffect, useCallback, useMemo} from 'react';
import * as Linking from 'expo-linking';
import {AuthContextType, User, withErrorHandling} from '../types/context-foundation';
import {UnifiedAuthService} from '../services/UnifiedAuthService';
import {logger as appLogger} from '../services/LoggerService';
import {authReducer, initialAuthState} from './auth/authState';
import {useFeatureActionGuard} from '@/features/featureControls/hooks';
import {googleSignInConfig} from '@/config/auth.config';
import type {AuthResult} from '@/types/auth.types';
import {markStartupPhase} from '@/services/StartupTelemetry';

// Create context-specific logger
const logger = appLogger.contextLogger('AuthContext');

// ============================================================================
// Context Creation
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const unifiedAuthService = UnifiedAuthService.getInstance();
  const emailSignInGuard = useFeatureActionGuard('auth.emailSignIn');
  const verifyEmailOtpGuard = useFeatureActionGuard('auth.verifyEmailOtp');
  const resendEmailOtpGuard = useFeatureActionGuard('auth.resendEmailOtp');
  const phoneSignInGuard = useFeatureActionGuard('auth.phoneSignIn');
  const verifyPhoneOtpGuard = useFeatureActionGuard('auth.verifyPhoneOtp');
  const resendPhoneOtpGuard = useFeatureActionGuard('auth.resendPhoneOtp');
  const anonymousSignInGuard = useFeatureActionGuard('auth.anonymousSignIn');
  const googleSignInGuard = useFeatureActionGuard('auth.googleSignIn');
  const signOutGuard = useFeatureActionGuard('auth.signOut');

  const initializeAuth = useCallback(() => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      const unsubscribe = unifiedAuthService.onAuthStateChanged((user) => {
        logger.info('Auth state changed', {hasUser: !!user});
        dispatch({type: 'SET_USER', payload: user});
        dispatch({type: 'SET_INITIALIZED', payload: true});
        markStartupPhase('auth_resolved');
      });

      // Google configuration is independent of local Supabase session restoration.
      void unifiedAuthService.configure(googleSignInConfig).catch((error) => {
        logger.warn('Google authentication configuration is unavailable', error);
      });

      return unsubscribe;
    } catch (error) {
      logger.error('Failed to initialize auth', error);
      dispatch({type: 'SET_ERROR', payload: 'Failed to initialize authentication'});
      dispatch({type: 'SET_INITIALIZED', payload: true});
      markStartupPhase('auth_resolved');
      return undefined;
    }
  }, [unifiedAuthService]);

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    const unsubscribe = initializeAuth();

    return () => {
      unsubscribe?.();
    };
  }, [initializeAuth]);

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  const signInWithEmail = useCallback(
    (email: string): Promise<{verificationId: string}> => {
      emailSignInGuard.assertAllowed();

      return withErrorHandling(
        async () => {
          dispatch({type: 'SET_LOADING', payload: true});
          dispatch({type: 'SET_ERROR', payload: null});

          try {
            const result = await unifiedAuthService.signInWithEmail(email);
            logger.info('Email verification sent successfully');
            return result;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Email authentication failed';
            dispatch({type: 'SET_ERROR', payload: errorMessage});
            throw error;
          } finally {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        },
        'AuthContext',
        'signInWithEmail',
      );
    },
    [emailSignInGuard, unifiedAuthService],
  );

  const verifyEmailOTP = useCallback(
    (email: string, otp: string): Promise<User> => {
      verifyEmailOtpGuard.assertAllowed();

      return withErrorHandling(
        async () => {
          dispatch({type: 'SET_LOADING', payload: true});
          dispatch({type: 'SET_ERROR', payload: null});

          try {
            const user = await unifiedAuthService.verifyEmailOtp(email, otp);
            logger.info('Email authentication verified successfully', {userId: user.uid});
            return user;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Email OTP verification failed';
            dispatch({type: 'SET_ERROR', payload: errorMessage});
            throw error;
          } finally {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        },
        'AuthContext',
        'verifyEmailOTP',
      );
    },
    [unifiedAuthService, verifyEmailOtpGuard],
  );

  const resendEmailOTP = useCallback(
    (email: string): Promise<void> => {
      resendEmailOtpGuard.assertAllowed();

      return withErrorHandling(
        async () => {
          dispatch({type: 'SET_LOADING', payload: true});
          dispatch({type: 'SET_ERROR', payload: null});

          try {
            await unifiedAuthService.resendEmailOtp(email);
            logger.info('Email verification resent successfully');
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to resend email OTP';
            dispatch({type: 'SET_ERROR', payload: errorMessage});
            throw error;
          } finally {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        },
        'AuthContext',
        'resendEmailOTP',
      );
    },
    [resendEmailOtpGuard, unifiedAuthService],
  );

  const handleAuthUrl = useCallback(
    async (url: string): Promise<User | null> => {
      return withErrorHandling(
        async () => {
          dispatch({type: 'SET_LOADING', payload: true});
          dispatch({type: 'SET_ERROR', payload: null});

          try {
            const user = await unifiedAuthService.handleAuthUrl(url);
            if (user) {
              logger.info('Authentication via auth URL succeeded', {userId: user.uid});
              dispatch({type: 'SET_USER', payload: user});
            }
            return user;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Authentication via URL failed';
            dispatch({type: 'SET_ERROR', payload: errorMessage});
            throw error;
          } finally {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        },
        'AuthContext',
        'handleAuthUrl',
      );
    },
    [unifiedAuthService],
  );

  useEffect(() => {
    const processIncomingUrl = (url: string) => {
      if (url.includes('access_token=') || url.includes('code=') || url.includes('auth/callback')) {
        logger.info('Detected incoming auth deep link URL');
        void handleAuthUrl(url);
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      processIncomingUrl(event.url);
    });

    void Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        processIncomingUrl(initialUrl);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleAuthUrl]);

  const signInWithPhone = useCallback(
    (phoneNumber: string): Promise<{verificationId: string}> => {
      phoneSignInGuard.assertAllowed();

      return withErrorHandling(
        async () => {
          dispatch({type: 'SET_LOADING', payload: true});
          dispatch({type: 'SET_ERROR', payload: null});

          try {
            const result = await unifiedAuthService.signInWithPhoneNumber(phoneNumber);
            logger.info('Phone verification sent successfully');
            return result;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Phone authentication failed';
            dispatch({type: 'SET_ERROR', payload: errorMessage});
            throw error;
          } finally {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        },
        'AuthContext',
        'signInWithPhone',
      );
    },
    [phoneSignInGuard, unifiedAuthService],
  );

  const verifyOTP = useCallback(
    (phoneNumber: string, otp: string): Promise<User> => {
      verifyPhoneOtpGuard.assertAllowed();

      return withErrorHandling(
        async () => {
          dispatch({type: 'SET_LOADING', payload: true});
          dispatch({type: 'SET_ERROR', payload: null});

          try {
            const user = await unifiedAuthService.verifyOtp(phoneNumber, otp);
            logger.info('Phone authentication verified successfully', {userId: user.uid});
            return user;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
            dispatch({type: 'SET_ERROR', payload: errorMessage});
            throw error;
          } finally {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        },
        'AuthContext',
        'verifyOTP',
      );
    },
    [unifiedAuthService, verifyPhoneOtpGuard],
  );

  const resendOTP = useCallback(
    (phoneNumber: string): Promise<void> => {
      resendPhoneOtpGuard.assertAllowed();

      return withErrorHandling(
        async () => {
          dispatch({type: 'SET_LOADING', payload: true});
          dispatch({type: 'SET_ERROR', payload: null});

          try {
            await unifiedAuthService.resendOtp(phoneNumber);
            logger.info('Phone verification resent successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
            dispatch({type: 'SET_ERROR', payload: errorMessage});
            throw error;
          } finally {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        },
        'AuthContext',
        'resendOTP',
      );
    },
    [resendPhoneOtpGuard, unifiedAuthService],
  );

  const signInAnonymously = useCallback(
    async (captchaToken?: string): Promise<void> => {
      anonymousSignInGuard.assertAllowed();

      return withErrorHandling(
        async () => {
          dispatch({type: 'SET_LOADING', payload: true});
          dispatch({type: 'SET_ERROR', payload: null});

          const result = await unifiedAuthService.signInAnonymously(captchaToken);

          if (result.type === 'error') {
            const errorMessage = result.error?.message || 'Anonymous sign-in failed';
            dispatch({type: 'SET_ERROR', payload: errorMessage});
            logger.error('Anonymous sign-in failed', result.error);
            throw new Error(errorMessage);
          }

          // User state will be updated via the auth state listener
          logger.info('Anonymous sign-in successful');
        },
        'AuthContext',
        'signInAnonymously',
      );
    },
    [anonymousSignInGuard, unifiedAuthService],
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    googleSignInGuard.assertAllowed();

    return withErrorHandling(
      async () => {
        dispatch({type: 'SET_LOADING', payload: true});
        dispatch({type: 'SET_ERROR', payload: null});

        const result = await unifiedAuthService.signInWithGoogle();

        if (result.type === 'error') {
          dispatch({type: 'SET_ERROR', payload: result.error?.message || 'Google sign-in failed'});
          throw new Error(result.error?.message || 'Google sign-in failed');
        }

        if (result.type === 'cancelled') {
          dispatch({type: 'SET_LOADING', payload: false});
          logger.info('Google sign-in cancelled by user');
          return result;
        }

        // User state will be updated via the auth state listener
        logger.info('Google sign-in successful');
        return result;
      },
      'AuthContext',
      'signInWithGoogle',
    );
  }, [googleSignInGuard, unifiedAuthService]);

  const signOut = useCallback(async (): Promise<void> => {
    signOutGuard.assertAllowed();

    return withErrorHandling(
      async () => {
        dispatch({type: 'SET_LOADING', payload: true});
        dispatch({type: 'SET_ERROR', payload: null});

        try {
          await unifiedAuthService.signOut();

          // State will be reset via the auth state listener
          logger.info('Sign out successful');
        } catch (error) {
          dispatch({type: 'SET_ERROR', payload: 'Failed to sign out'});
          throw error;
        }
      },
      'AuthContext',
      'signOut',
    );
  }, [signOutGuard, unifiedAuthService]);

  // ============================================================================
  // Utility Methods
  // ============================================================================

  const clearError = useCallback(() => {
    dispatch({type: 'SET_ERROR', payload: null});
  }, []);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isAuthenticated = useMemo(() => {
    return !!state.user;
  }, [state.user]);

  const isAnonymous = useMemo(() => {
    return !!state.user?.isAnonymous;
  }, [state.user]);

  // ============================================================================
  // Context Value (Memoized)
  // ============================================================================

  const contextValue = useMemo<AuthContextType>(
    () => ({
      // Authentication state
      user: state.user,
      isAuthenticated,
      isAnonymous,

      // Authentication methods
      signInWithPhone,
      signInWithEmail,
      verifyEmailOTP,
      resendEmailOTP,
      handleAuthUrl,
      verifyOTP,
      resendOTP,
      signInWithGoogle,
      signInAnonymously,
      signOut,

      // State
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
      error: state.error,

      // Utility methods
      clearError,
      isAccountDeletionInProgress: state.isAccountDeletionInProgress,
      setAccountDeletionInProgress: (inProgress: boolean) =>
        dispatch({type: 'SET_DELETION_IN_PROGRESS', payload: inProgress}),
    }),
    [
      state.user,
      state.isLoading,
      state.isInitialized,
      state.error,
      state.isAccountDeletionInProgress,
      isAuthenticated,
      isAnonymous,
      signInWithPhone,
      signInWithEmail,
      verifyEmailOTP,
      resendEmailOTP,
      handleAuthUrl,
      verifyOTP,
      resendOTP,
      signInWithGoogle,
      signInAnonymously,
      signOut,
      clearError,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// ============================================================================
// Hook
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
