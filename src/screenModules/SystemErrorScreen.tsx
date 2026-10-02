/**
 * System Error Screen
 *
 * Polished Fluid Surface fallback displayed when an unexpected JavaScript error occurs.
 * Replaces old raw ErrorBoundary fallback.
 */

import React, {useState} from 'react';
import {YStack, XStack, ScrollView} from 'tamagui';
import {Button, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {router} from 'expo-router';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {DayNightThemeSwitch} from '@/components/ui/DayNightThemeSwitch';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import errorMessageService from '@/services/ErrorMessageService';

interface SystemErrorScreenProps {
  error?: Error;
  retry?: () => void;
  onRestart?: () => void;
  showThemeSwitch?: boolean;
}

export const SystemErrorScreen: React.FC<SystemErrorScreenProps> = ({
  error,
  retry,
  onRestart,
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
  const [showDebug, setShowDebug] = useState(false);

  const userFriendlyError = error
    ? errorMessageService.getUserFriendlyError(error, {screen: 'SystemErrorScreen'})
    : null;

  const displayTitle = userFriendlyError?.title || 'Something went wrong';
  const displayMessage =
    userFriendlyError?.message ||
    'We encountered an unexpected error. Don’t worry, your accounts and data remain safe.';

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
    } else {
      try {
        router.replace('/');
      } catch {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    }
  };

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} showDots={true}>
      {/* Top Header Row with Theme Switch */}
      <XStack
        width="100%"
        justifyContent="flex-end"
        alignItems="center"
        paddingHorizontal="$4"
        paddingTop="$2"
        paddingBottom="$2">
        {showThemeSwitch && (
          <DayNightThemeSwitch
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            testID="system-error-theme-switch"
            accessibilityLabel="Toggle Theme"
          />
        )}
      </XStack>

      {/* Center Fluid Surface Card */}
      <YStack flex={1} justifyContent="center" paddingHorizontal="$4" paddingBottom="$6">
        <GlassSurface padding="$5" borderRadius={20}>
          <YStack alignItems="center" gap="$3.5">
            {/* Error Badge */}
            <XStack
              backgroundColor={isDarkMode ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.12)'}
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius={999}
              alignItems="center"
              gap="$1.5">
              <Ionicons name="alert-circle" size={14} color={isDarkMode ? '#f87171' : '#dc2626'} />
              <Text
                fontSize="$2"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing={1}
                color={isDarkMode ? '#f87171' : '#b91c1c'}>
                System Error
              </Text>
            </XStack>

            {/* Emblem / Icon Container */}
            <YStack
              width={76}
              height={76}
              borderRadius={38}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isDarkMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.15)'}>
              <Ionicons
                name="warning-outline"
                size={40}
                color={isDarkMode ? '#f87171' : '#dc2626'}
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
              {retry && (
                <Button
                  backgroundColor="$blue10"
                  color="white"
                  borderRadius={14}
                  height={50}
                  onPress={retry}
                  pressStyle={{opacity: 0.85}}
                  accessibilityLabel="Try Again">
                  <XStack alignItems="center" gap="$2">
                    <Ionicons name="reload-outline" size={18} color="white" />
                    <Text color="white" fontWeight="700" fontSize="$4">
                      Try Again
                    </Text>
                  </XStack>
                </Button>
              )}

              <Button
                variant="outline"
                borderColor="$borderColor"
                color="$color"
                borderRadius={14}
                height={50}
                onPress={handleRestart}
                accessibilityLabel="Restart app to dashboard">
                <XStack alignItems="center" gap="$2">
                  <Ionicons
                    name="home-outline"
                    size={18}
                    color={isDarkMode ? '#e4e4e7' : '#27272a'}
                  />
                  <Text color="$color" fontWeight="600" fontSize="$3">
                    Restart App
                  </Text>
                </XStack>
              </Button>
            </YStack>

            {/* Expandable Debug Section in Development */}
            {Boolean(error?.message || userFriendlyError?.technicalDetails) && (
              <YStack width="100%" marginTop="$2">
                <Button
                  variant="outline"
                  borderColor="transparent"
                  onPress={() => setShowDebug((prev) => !prev)}
                  paddingVertical="$1">
                  <XStack alignItems="center" gap="$1">
                    <Ionicons
                      name={showDebug ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={isDarkMode ? '#a1a1aa' : '#71717a'}
                    />
                    <Text fontSize="$2" color="$color11">
                      {showDebug ? 'Hide Error Details' : 'View Error Details'}
                    </Text>
                  </XStack>
                </Button>

                {showDebug && (
                  <YStack
                    marginTop="$2"
                    padding="$3"
                    borderRadius={10}
                    backgroundColor={isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.05)'}>
                    <ScrollView maxHeight={180} showsVerticalScrollIndicator={false}>
                      <Text fontSize="$2" fontFamily="$mono" color="$red9" fontWeight="600">
                        {error?.name}: {error?.message}
                      </Text>
                      {Boolean(error?.stack) && (
                        <Text
                          fontSize="$1"
                          fontFamily="$mono"
                          color="$color11"
                          marginTop="$2"
                          lineHeight={16}>
                          {error?.stack}
                        </Text>
                      )}
                    </ScrollView>
                  </YStack>
                )}
              </YStack>
            )}
          </YStack>
        </GlassSurface>
      </YStack>
    </ScreenContainer>
  );
};

export default SystemErrorScreen;
