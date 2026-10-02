import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Button, Text} from '@ravitamil/buddy-ui';
import {YStack} from 'tamagui';
import {useRouter} from 'expo-router';

import {useAuth} from '@/context/AuthContext';
import {useUser} from '@/context/UserContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import {AuthenticationScreen} from './AuthenticationScreen';
import {StartupShell} from '@/features/startup/components/StartupShell';
import {markStartupPhase} from '@/services/StartupTelemetry';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

type GuardState = 'starting' | 'authentication' | 'profile' | 'recovery' | 'onboarding' | 'ready';

export function AuthGuard({children, fallback}: AuthGuardProps) {
  const auth = useAuth();
  const {profile, isLoading: isProfileLoading, error: profileError, refreshProfile} = useUser();
  const router = useRouter();
  const onboardingRedirectedForUser = useRef<string | null>(null);

  const guardState = useMemo<GuardState>(() => {
    if (!auth.isInitialized) return 'starting';
    if (!auth.isAuthenticated || !auth.user) return 'authentication';
    if (profileError && !profile) return 'recovery';
    if (!profile || isProfileLoading) return 'profile';
    if (!profile.isOnboardingComplete) return 'onboarding';
    return 'ready';
  }, [
    auth.isAuthenticated,
    auth.isInitialized,
    auth.user,
    isProfileLoading,
    profile,
    profileError,
  ]);

  useEffect(() => {
    if (guardState !== 'onboarding' || !auth.user) return;
    if (onboardingRedirectedForUser.current === auth.user.uid) return;

    onboardingRedirectedForUser.current = auth.user.uid;
    router.replace('/create-profile');
  }, [auth.user, guardState, router]);

  const handleInteractiveLayout = useCallback(() => {
    markStartupPhase('app_interactive');
  }, []);

  const handleRetryProfile = useCallback(() => {
    void refreshProfile();
  }, [refreshProfile]);

  if (guardState === 'starting') {
    return fallback ?? <StartupShell message="Restoring your session…" />;
  }

  if (guardState === 'authentication') {
    return (
      <YStack flex={1} onLayout={handleInteractiveLayout}>
        <AuthenticationScreen />
      </YStack>
    );
  }

  if (guardState === 'profile') {
    return fallback ?? <StartupShell message="Loading your profile…" />;
  }

  if (guardState === 'recovery') {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap="$4"
        padding="$6"
        backgroundColor="$background"
        onLayout={handleInteractiveLayout}>
        <Text selectable color="$color" fontFamily="$heading" fontSize="$6" fontWeight="700">
          We couldn&apos;t load your profile
        </Text>
        <Text
          selectable
          color="$colorTransparent"
          fontFamily="$body"
          fontSize="$4"
          textAlign="center">
          Check your connection and try again. Your account has not been sent back to onboarding.
        </Text>
        <Button theme="blue" onPress={handleRetryProfile}>
          Try again
        </Button>
      </YStack>
    );
  }

  if (guardState === 'onboarding') {
    return fallback ?? <StartupShell message="Opening profile setup…" />;
  }

  return (
    <YStack flex={1} onLayout={handleInteractiveLayout}>
      <ErrorBoundary>
        <>{children}</>
      </ErrorBoundary>
    </YStack>
  );
}

export default AuthGuard;
