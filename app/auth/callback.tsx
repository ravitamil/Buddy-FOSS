import React, {useEffect, useState} from 'react';
import {router} from 'expo-router';
import * as Linking from 'expo-linking';
import {YStack} from 'tamagui';
import {Button, GlassSurface, LoadingIndicator, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScreenContainer} from '@/components/ui';
import {useAuth} from '@/context/AuthContext';
import {logger as appLogger} from '@/services/LoggerService';

const logger = appLogger.contextLogger('AuthCallback');

export default function AuthCallbackScreen() {
  const {handleAuthUrl, user} = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function processAuth() {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && handleAuthUrl) {
          logger.info('Processing auth callback URL:', initialUrl);
          const authenticatedUser = await handleAuthUrl(initialUrl);
          if (authenticatedUser && isMounted) {
            router.replace('/(tabs)');
            return;
          }
        }

        // If user is already authenticated
        if (user && isMounted) {
          router.replace('/(tabs)');
        }
      } catch (err) {
        logger.error('Failed to process auth callback', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Authentication failed');
        }
      }
    }

    void processAuth();

    return () => {
      isMounted = false;
    };
  }, [handleAuthUrl, user]);

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <YStack width="100%" maxWidth={360}>
          <GlassSurface padding="$5" borderRadius={24}>
            <YStack alignItems="center" gap="$4">
              {error ? (
                <>
                  <Ionicons name="alert-circle" size={44} color="#ef4444" />
                  <Text fontSize="$5" fontWeight="700" color="$color" textAlign="center">
                    Authentication Failed
                  </Text>
                  <Text fontSize="$3" color="$colorSecondary" textAlign="center">
                    {error}
                  </Text>
                  <Button
                    variant="primary"
                    size="medium"
                    onPress={() => router.replace('/email-login')}
                    marginTop="$2">
                    Back to Login
                  </Button>
                </>
              ) : (
                <>
                  <LoadingIndicator size="large" color="$primary" />
                  <Text fontSize="$5" fontWeight="700" color="$color" textAlign="center">
                    Completing sign-in...
                  </Text>
                  <Text fontSize="$3" color="$colorSecondary" textAlign="center">
                    Verifying your credentials
                  </Text>
                </>
              )}
            </YStack>
          </GlassSurface>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
