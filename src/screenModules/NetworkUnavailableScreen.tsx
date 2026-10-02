/**
 * Network Unavailable Screen
 *
 * Rendered when network connectivity is completely lost for an online-dependent action.
 * Features the beloved no-internet Lottie animation and Fluid Surface styling.
 */

import React, {useState} from 'react';
import {YStack, XStack} from 'tamagui';
import {Button, GlassSurface, LottieAnimationView, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useRouter} from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {DayNightThemeSwitch} from '@/components/ui/DayNightThemeSwitch';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import noInternetAnimation from '../../assets/lottie/no-internet.json';

interface NetworkUnavailableScreenProps {
  onRetry?: () => Promise<void> | void;
  onContinueOffline?: () => void;
  canDismiss?: boolean;
}

export const NetworkUnavailableScreen: React.FC<NetworkUnavailableScreenProps> = ({
  onRetry,
  onContinueOffline,
  canDismiss = true,
}) => {
  const router = useRouter();
  let isDarkMode = false;
  let toggleTheme = () => {};
  try {
    const themeContext = useTamaguiTheme();
    isDarkMode = themeContext.isDarkMode;
    toggleTheme = () => {
      void themeContext.toggleTheme();
    };
  } catch {
    // Graceful fallback if rendered outside TamaguiThemeProvider
  }
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    void (async () => {
      try {
        if (onRetry) {
          await onRetry();
        } else {
          const state = await NetInfo.fetch();
          if (state.isConnected && canDismiss) {
            router.back();
          }
        }
      } finally {
        setIsRetrying(false);
      }
    })();
  };

  const handleContinueOffline = () => {
    if (onContinueOffline) {
      onContinueOffline();
    } else if (canDismiss) {
      router.back();
    }
  };

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} showDots={true}>
      {/* Top Header with Theme Switch and optional back button */}
      <XStack
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$4"
        paddingTop="$2"
        paddingBottom="$2">
        {canDismiss ? (
          <Button
            size="small"
            variant="outline"
            borderColor="$borderColor"
            onPress={handleContinueOffline}
            accessibilityLabel="Close offline screen">
            <Ionicons name="close" size={18} color={isDarkMode ? '#e4e4e7' : '#27272a'} />
          </Button>
        ) : (
          <XStack />
        )}

        <DayNightThemeSwitch
          checked={isDarkMode}
          onCheckedChange={toggleTheme}
          testID="offline-theme-switch"
          accessibilityLabel="Toggle Theme"
        />
      </XStack>

      {/* Center Fluid Surface Card */}
      <YStack flex={1} justifyContent="center" paddingHorizontal="$4" paddingBottom="$6">
        <GlassSurface padding="$5" borderRadius={20}>
          <YStack alignItems="center" gap="$3">
            {/* Offline Status Badge */}
            <XStack
              backgroundColor={isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)'}
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius={999}
              alignItems="center"
              gap="$1.5">
              <Ionicons name="cloud-offline" size={14} color={isDarkMode ? '#f87171' : '#dc2626'} />
              <Text
                fontSize="$2"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing={1}
                color={isDarkMode ? '#f87171' : '#b91c1c'}>
                No Connection
              </Text>
            </XStack>

            {/* Beloved Lottie Animation */}
            <YStack alignItems="center" justifyContent="center" height={160} width={160}>
              <LottieAnimationView
                source={noInternetAnimation}
                autoPlay
                loop
                width={160}
                height={160}
              />
            </YStack>

            {/* Text Header */}
            <YStack alignItems="center" gap="$2">
              <Text
                fontSize="$6"
                fontWeight="800"
                color="$color"
                textAlign="center"
                fontFamily="$heading">
                You’re Offline
              </Text>

              <Text
                fontSize="$3"
                color="$color11"
                textAlign="center"
                lineHeight={22}
                maxWidth={320}>
                Buddy couldn’t reach the network. Please verify your Wi-Fi or mobile data settings.
              </Text>
            </YStack>

            {/* Reassurance Information Box */}
            <XStack
              alignItems="flex-start"
              gap="$2.5"
              backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'}
              padding="$3"
              borderRadius={12}
              width="100%">
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={isDarkMode ? '#34d399' : '#059669'}
                style={{marginTop: 1}}
              />
              <Text fontSize="$3" color="$color11" flex={1} lineHeight={19}>
                Don’t worry — your offline transactions and account records remain securely stored
                on this device.
              </Text>
            </XStack>

            {/* Actions (min 48pt touch targets) */}
            <YStack width="100%" gap="$3" marginTop="$2">
              <Button
                backgroundColor="$blue10"
                color="white"
                borderRadius={14}
                height={50}
                onPress={handleRetry}
                pressStyle={{opacity: 0.85}}
                accessibilityLabel="Try reconnecting to the internet">
                <XStack alignItems="center" gap="$2">
                  <Ionicons
                    name={isRetrying ? 'reload' : 'refresh-outline'}
                    size={18}
                    color="white"
                  />
                  <Text color="white" fontWeight="700" fontSize="$4">
                    {isRetrying ? 'Reconnecting…' : 'Try Again'}
                  </Text>
                </XStack>
              </Button>

              {canDismiss && (
                <Button
                  variant="outline"
                  borderColor="$borderColor"
                  color="$color"
                  borderRadius={14}
                  height={50}
                  onPress={handleContinueOffline}
                  accessibilityLabel="Continue using the app in offline mode">
                  <Text color="$color" fontWeight="600" fontSize="$3">
                    Continue in Offline Mode
                  </Text>
                </Button>
              )}
            </YStack>
          </YStack>
        </GlassSurface>
      </YStack>
    </ScreenContainer>
  );
};

export default NetworkUnavailableScreen;
