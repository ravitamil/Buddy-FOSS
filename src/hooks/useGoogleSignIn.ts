/**
 * Google Sign-In Hook
 * Provides simplified sign-in functionality with loading and error states
 */

import {useState, useCallback} from 'react';
import {useGoogleAuth} from './useGoogleAuth';
import {UseGoogleSignInReturn, AuthResult} from '../types/auth.types';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Sign-in failed';
};

/**
 * Hook for Google Sign-In operations
 */
export function useGoogleSignIn(): UseGoogleSignInReturn {
  const {signIn: contextSignIn, authState} = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await contextSignIn();

      if (result.type === 'cancelled') {
        setError('Sign-in was cancelled');
      }

      return result;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return {type: 'cancelled', error: {code: 'CANCELLED', message: errorMessage}};
    } finally {
      setIsLoading(false);
    }
  }, [contextSignIn]);

  return {
    signIn,
    isLoading: isLoading || authState.isLoading,
    error: error || authState.error,
  };
}

export default useGoogleSignIn;
