/**
 * Service Unavailable / Maintenance Screen
 *
 * Rendered when Buddy servers are under scheduled maintenance or experiencing
 * a temporary service outage. Adheres strictly to the Fluid Surface design system.
 */

import React, {useState} from 'react';
import {YStack, XStack} from 'tamagui';
import {Button, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {Image} from 'expo-image';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {DayNightThemeSwitch} from '@/components/ui/DayNightThemeSwitch';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAppSystemStatus} from '@/features/systemStatus/AppSystemStatusProvider';
import coinsLogoSource from '../../assets/appLogo/coins-logo.png';

interface ServiceUnavailableScreenProps {
  title?: string;
  message?: string;
  estimatedEndTime?: string;
  onRetry?: () => Promise<void> | void;
  onOfflineMode?: () => void;
  showThemeSwitch?: boolean;
}

export const ServiceUnavailableScreen: React.FC<ServiceUnavailableScreenProps> = ({
  title,
  message,
  estimatedEndTime,
  onRetry,
  onOfflineMode,
  showThemeSwitch = true,
}) => {
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
  const systemStatus = useAppSystemStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  const displayTitle = title ?? systemStatus.service.title ?? 'We’re Under Scheduled Maintenance';
  const displayMessage =
    message ??
    systemStatus.service.message ??
    'Buddy is undergoing vital system updates to ensure peak performance and security. Your financial data is safe and will sync automatically when services resume.';
  const displayEstimatedTime =
    estimatedEndTime ?? systemStatus.service.estimatedEndTime ?? 'Expected completion in ~15 mins';

  const handleRetry = () => {
    setIsRetrying(true);
    void (async () => {
      try {
        if (onRetry) {
          await onRetry();
        } else {
          await systemStatus.checkStatus();
        }
      } finally {
        setIsRetrying(false);
      }
    })();
  };

  const handleOfflineMode = () => {
    if (onOfflineMode) {
      onOfflineMode();
    } else {
      systemStatus.setOfflineBypass(true);
    }
  };

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} showDots={true}>
      {/* Top Header Row with Logo and Theme Switch */}
      <XStack
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$4"
        paddingTop="$2"
        paddingBottom="$4">
        <XStack alignItems="center" gap="$2">
          <Image
            source={coinsLogoSource}
            contentFit="contain"
            style={{width: 36, height: 36}}
            accessibilityLabel="Buddy Logo"
          />
          <Text fontSize="$5" fontWeight="700" color="$color" fontFamily="$heading">
            Buddy
          </Text>
        </XStack>

        {showThemeSwitch && (
          <DayNightThemeSwitch
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            testID="maintenance-theme-switch"
            accessibilityLabel="Toggle Theme"
          />
        )}
      </XStack>

      {/* Center Fluid Surface Card */}
      <YStack flex={1} justifyContent="center" paddingHorizontal="$4" paddingBottom="$8">
        <GlassSurface padding="$5" borderRadius={20}>
          <YStack alignItems="center" gap="$4">
            {/* Maintenance Status Badge */}
            <XStack
              backgroundColor={isDarkMode ? 'rgba(245, 158, 11, 0.18)' : 'rgba(251, 191, 36, 0.25)'}
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius={999}
              alignItems="center"
              gap="$1.5">
              <Ionicons name="construct" size={14} color={isDarkMode ? '#fbbf24' : '#d97706'} />
              <Text
                fontSize="$2"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing={1}
                color={isDarkMode ? '#fbbf24' : '#b45309'}>
                System Maintenance
              </Text>
            </XStack>

            {/* Emblem / Icon Container */}
            <YStack
              width={76}
              height={76}
              borderRadius={38}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isDarkMode ? 'rgba(245, 158, 11, 0.12)' : 'rgba(251, 191, 36, 0.2)'}>
              <Ionicons
                name="server-outline"
                size={38}
                color={isDarkMode ? '#fbbf24' : '#d97706'}
              />
            </YStack>

            {/* Text Copy */}
            <YStack alignItems="center" gap="$2">
              <Text
                fontSize="$6"
                fontWeight="800"
                color="$color"
                textAlign="center"
                fontFamily="$heading">
                {displayTitle}
              </Text>

              <Text
                fontSize="$3"
                color="$color11"
                textAlign="center"
                lineHeight={22}
                maxWidth={320}>
                {displayMessage}
              </Text>
            </YStack>

            {/* Estimated Recovery Pill */}
            {Boolean(displayEstimatedTime) && (
              <XStack
                alignItems="center"
                gap="$2"
                backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius={10}>
                <Ionicons
                  name="time-outline"
                  size={15}
                  color={isDarkMode ? '#a1a1aa' : '#71717a'}
                />
                <Text fontSize="$2" color="$color11" fontWeight="500">
                  {displayEstimatedTime}
                </Text>
              </XStack>
            )}

            {/* Interactive Actions (min 48pt touch targets) */}
            <YStack width="100%" gap="$3" marginTop="$2">
              <Button
                backgroundColor="$blue10"
                color="white"
                borderRadius={14}
                height={50}
                onPress={handleRetry}
                pressStyle={{opacity: 0.85}}
                accessibilityLabel="Check again to see if service is restored">
                <XStack alignItems="center" gap="$2">
                  <Ionicons
                    name={isRetrying ? 'reload' : 'refresh-outline'}
                    size={18}
                    color="white"
                  />
                  <Text color="white" fontWeight="700" fontSize="$4">
                    {isRetrying ? 'Checking Status…' : 'Check Again'}
                  </Text>
                </XStack>
              </Button>

              <Button
                variant="outline"
                borderColor="$borderColor"
                color="$color"
                borderRadius={14}
                height={50}
                onPress={handleOfflineMode}
                accessibilityLabel="Continue using app in offline mode with cached data">
                <XStack alignItems="center" gap="$2">
                  <Ionicons
                    name="folder-open-outline"
                    size={18}
                    color={isDarkMode ? '#e4e4e7' : '#27272a'}
                  />
                  <Text color="$color" fontWeight="600" fontSize="$3">
                    Continue in Offline Mode
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </YStack>
        </GlassSurface>
      </YStack>
    </ScreenContainer>
  );
};

export default ServiceUnavailableScreen;
