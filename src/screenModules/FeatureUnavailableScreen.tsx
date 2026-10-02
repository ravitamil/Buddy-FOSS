/**
 * Feature Unavailable Screen
 *
 * Polished Fluid Surface screen rendered when a specific feature or route
 * is placed under maintenance, disabled, or restricted by feature controls.
 */

import React from 'react';
import {YStack, XStack} from 'tamagui';
import {Button, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useRouter} from 'expo-router';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {DayNightThemeSwitch} from '@/components/ui/DayNightThemeSwitch';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {FeatureStatus} from '@/features/featureControls/types';

interface FeatureUnavailableScreenProps {
  title?: string;
  message?: string;
  status?: FeatureStatus;
  showThemeSwitch?: boolean;
  onGoBack?: () => void;
  onGoDashboard?: () => void;
}

const statusBadgeConfig: Record<
  FeatureStatus,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    colorDark: string;
    colorLight: string;
    bgDark: string;
    bgLight: string;
  }
> = {
  maintenance: {
    label: 'Under Maintenance',
    icon: 'construct',
    colorDark: '#fbbf24',
    colorLight: '#d97706',
    bgDark: 'rgba(245, 158, 11, 0.18)',
    bgLight: 'rgba(251, 191, 36, 0.25)',
  },
  read_only: {
    label: 'Read Only Mode',
    icon: 'eye-outline',
    colorDark: '#60a5fa',
    colorLight: '#2563eb',
    bgDark: 'rgba(59, 130, 246, 0.18)',
    bgLight: 'rgba(37, 99, 235, 0.15)',
  },
  hidden: {
    label: 'Feature Unavailable',
    icon: 'lock-closed-outline',
    colorDark: '#a1a1aa',
    colorLight: '#71717a',
    bgDark: 'rgba(161, 161, 170, 0.18)',
    bgLight: 'rgba(113, 113, 122, 0.15)',
  },
  disabled: {
    label: 'Temporarily Disabled',
    icon: 'pause-circle-outline',
    colorDark: '#f87171',
    colorLight: '#dc2626',
    bgDark: 'rgba(239, 68, 68, 0.18)',
    bgLight: 'rgba(239, 68, 68, 0.15)',
  },
  enabled: {
    label: 'Feature Active',
    icon: 'checkmark-circle-outline',
    colorDark: '#34d399',
    colorLight: '#059669',
    bgDark: 'rgba(52, 211, 153, 0.18)',
    bgLight: 'rgba(5, 150, 105, 0.15)',
  },
};

export const FeatureUnavailableScreen: React.FC<FeatureUnavailableScreenProps> = ({
  title,
  message,
  status = 'disabled',
  showThemeSwitch = true,
  onGoBack,
  onGoDashboard,
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
  const badgeConfig = statusBadgeConfig[status] ?? statusBadgeConfig.disabled;

  const displayTitle = title ?? 'Feature Temporarily Unavailable';
  const displayMessage =
    message ??
    'This area is currently being updated or is temporarily restricted. Other sections of Buddy remain fully operational.';

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  const handleDashboard = () => {
    if (onGoDashboard) {
      onGoDashboard();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} showDots={true}>
      {/* Top Header Row with Back Button and Theme Switch */}
      <XStack
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$4"
        paddingTop="$2"
        paddingBottom="$2">
        <Button
          size="small"
          variant="outline"
          borderColor="$borderColor"
          onPress={handleBack}
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={18} color={isDarkMode ? '#e4e4e7' : '#27272a'} />
        </Button>

        {showThemeSwitch && (
          <DayNightThemeSwitch
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            testID="feature-unavailable-theme-switch"
            accessibilityLabel="Toggle Theme"
          />
        )}
      </XStack>

      {/* Center Fluid Surface Card */}
      <YStack flex={1} justifyContent="center" paddingHorizontal="$4" paddingBottom="$6">
        <GlassSurface padding="$5" borderRadius={20}>
          <YStack alignItems="center" gap="$3.5">
            {/* Status Badge */}
            <XStack
              backgroundColor={isDarkMode ? badgeConfig.bgDark : badgeConfig.bgLight}
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius={999}
              alignItems="center"
              gap="$1.5">
              <Ionicons
                name={badgeConfig.icon}
                size={14}
                color={isDarkMode ? badgeConfig.colorDark : badgeConfig.colorLight}
              />
              <Text
                fontSize="$2"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing={1}
                color={isDarkMode ? badgeConfig.colorDark : badgeConfig.colorLight}>
                {badgeConfig.label}
              </Text>
            </XStack>

            {/* Emblem / Icon Container */}
            <YStack
              width={76}
              height={76}
              borderRadius={38}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isDarkMode ? badgeConfig.bgDark : badgeConfig.bgLight}>
              <Ionicons
                name={badgeConfig.icon}
                size={38}
                color={isDarkMode ? badgeConfig.colorDark : badgeConfig.colorLight}
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

            {/* Actions (min 48pt touch targets) */}
            <YStack width="100%" gap="$3" marginTop="$2">
              <Button
                backgroundColor="$blue10"
                color="white"
                borderRadius={14}
                height={50}
                onPress={handleDashboard}
                pressStyle={{opacity: 0.85}}
                accessibilityLabel="Go to home dashboard">
                <XStack alignItems="center" gap="$2">
                  <Ionicons name="home-outline" size={18} color="white" />
                  <Text color="white" fontWeight="700" fontSize="$4">
                    Go to Dashboard
                  </Text>
                </XStack>
              </Button>

              <Button
                variant="outline"
                borderColor="$borderColor"
                color="$color"
                borderRadius={14}
                height={50}
                onPress={handleBack}
                accessibilityLabel="Return to previous screen">
                <Text color="$color" fontWeight="600" fontSize="$3">
                  Go Back
                </Text>
              </Button>
            </YStack>
          </YStack>
        </GlassSurface>
      </YStack>
    </ScreenContainer>
  );
};

export default FeatureUnavailableScreen;
