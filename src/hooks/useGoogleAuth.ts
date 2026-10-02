import {useCallback, useMemo} from 'react';

import {useAuth} from '../context/AuthContext';
import {UnifiedAuthService} from '../services/UnifiedAuthService';
import type {GoogleUser, UseGoogleAuthReturn} from '../types/auth.types';

/**
 * Hook to access Google authentication state and methods
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const auth = useAuth();
  const unifiedAuthService = UnifiedAuthService.getInstance();

  const googleUser = useMemo<GoogleUser | null>(() => {
    if (!auth.user) return null;

    return {
      id: auth.user.uid,
      name: auth.user.displayName,
      email: auth.user.email ?? '',
      photo: auth.user.photoURL,
      familyName: null,
      givenName: null,
    };
  }, [auth.user]);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const tokens = await unifiedAuthService.getGoogleTokens();
    return tokens !== null;
  }, [unifiedAuthService]);

  const getAuthToken = useCallback(
    (): Promise<string | null> => unifiedAuthService.getSessionToken(),
    [unifiedAuthService],
  );

  return {
    authState: {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      user: googleUser,
      authUser: auth.user,
      tokens: null,
      error: auth.error,
      isGoogleLinked: auth.user?.authProvider === 'google',
      authListenerResolved: auth.isInitialized,
    },
    signIn: auth.signInWithGoogle,
    signOut: auth.signOut,
    refreshTokens,
    clearError: auth.clearError,
    isTokenValid: () => auth.isAuthenticated,
    linkWithGoogle: auth.signInWithGoogle,
    unlinkGoogle: () => Promise.resolve(false),
    getAuthUser: () => auth.user,
    getAuthToken,
  };
}

export default useGoogleAuth;
