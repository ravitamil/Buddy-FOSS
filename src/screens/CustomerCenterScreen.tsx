import React from 'react';
import {useRouter} from 'expo-router';
import {YStack} from 'tamagui';
import {GlassSurface, Button, Text} from '@ravitamil/buddy-ui';
import {ScreenContainer, CustomNavigationHeader} from '../components/ui';

const CustomerCenterScreen: React.FC = () => {
  const router = useRouter();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      <CustomNavigationHeader title="Subscription" onBackPress={() => router.back()} />
      <YStack flex={1} padding="$4" justifyContent="center" alignItems="center">
        <YStack maxWidth={400} width="100%">
          <GlassSurface>
            <YStack padding="$5" alignItems="center" gap="$4">
              <Text fontSize="$7" fontWeight="bold" textAlign="center" color="$text">
                Community Lifetime
              </Text>
              <Text fontSize="$4" color="$textMuted" textAlign="center" lineHeight={22}>
                Your Buddy installation has full access to all features. No subscriptions, no
                tracking, and no external billing accounts.
              </Text>
              <YStack width="100%" paddingTop="$2">
                <Button onPress={() => router.back()} size="large">
                  Back
                </Button>
              </YStack>
            </YStack>
          </GlassSurface>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};

export default CustomerCenterScreen;
