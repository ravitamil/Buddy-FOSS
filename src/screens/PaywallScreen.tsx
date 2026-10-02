import React from 'react';
import {useRouter} from 'expo-router';
import {YStack} from 'tamagui';
import {GlassSurface, Button, Text} from '@ravitamil/buddy-ui';
import {ScreenContainer, CustomNavigationHeader} from '../components/ui';

const PaywallScreen: React.FC = () => {
  const router = useRouter();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      <CustomNavigationHeader title="Pro Unlocked" onBackPress={() => router.back()} />
      <YStack flex={1} padding="$4" justifyContent="center" alignItems="center">
        <YStack maxWidth={400} width="100%">
          <GlassSurface>
            <YStack padding="$5" alignItems="center" gap="$4">
              <Text fontSize="$7" fontWeight="bold" textAlign="center" color="$text">
                All Features Unlocked
              </Text>
              <Text fontSize="$4" color="$textMuted" textAlign="center" lineHeight={22}>
                You are using the Community Edition of Buddy. All features, analytics, and trackers
                are 100% unlocked with zero paywalls.
              </Text>
              <YStack width="100%" paddingTop="$2">
                <Button onPress={() => router.back()} size="large">
                  Continue
                </Button>
              </YStack>
            </YStack>
          </GlassSurface>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};

export default PaywallScreen;
