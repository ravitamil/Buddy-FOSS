/**
 * Force Upgrade Screen
 *
 * Rendered when the installed app version is below the minimum required version.
 * Non-dismissible blocking view directing the user to the App Store / Google Play.
 */

import React, {useState} from 'react';
import {Platform} from 'react-native';
import {YStack, XStack} from 'tamagui';
import {Button, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {Image} from 'expo-image';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {DayNightThemeSwitch} from '@/components/ui/DayNightThemeSwitch';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAppSystemStatus} from '@/features/systemStatus/AppSystemStatusProvider';
import {openAppStore} from '@/features/systemStatus/service';
import coinsLogoSource from '../../assets/appLogo/coins-logo.png';

interface ForceUpgradeScreenProps {
  currentVersion?: string;
  minRequiredVersion?: string;
  releaseNotes?: string[];
  onUpdatePress?: () => void;
  showThemeSwitch?: boolean;
}

export const ForceUpgradeScreen: React.FC<ForceUpgradeScreenProps> = ({
  currentVersion,
  minRequiredVersion,
  releaseNotes,
  onUpdatePress,
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
  const [isApplyingOta, setIsApplyingOta] = useState(false);

  const displayCurrentVersion = currentVersion ?? systemStatus.upgrade.currentVersion;
  const displayRequiredVersion = minRequiredVersion ?? systemStatus.upgrade.minRequiredVersion;
  const displayNotes = releaseNotes ??
    systemStatus.upgrade.releaseNotes ?? [
      'Critical database synchronization improvements',
      'Enhanced security and data encryption protocols',
      'Fluid Surface interface optimizations and bug fixes',
    ];

  const handleUpdate = () => {
    if (onUpdatePress) {
      onUpdatePress();
    } else {
      void openAppStore();
    }
  };

  const handleRestartOta = () => {
    setIsApplyingOta(true);
    void (async () => {
      try {
        await systemStatus.applyOtaUpdate();
      } finally {
        setIsApplyingOta(false);
      }
    })();
  };

  const storeLabel = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} showDots={true}>
      {/* Top Header Row with Logo */}
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
            testID="upgrade-theme-switch"
            accessibilityLabel="Toggle Theme"
          />
        )}
      </XStack>

      {/* Center Fluid Surface Card */}
      <YStack flex={1} justifyContent="center" paddingHorizontal="$4" paddingBottom="$8">
        <GlassSurface padding="$5" borderRadius={20}>
          <YStack alignItems="center" gap="$4">
            {/* Required Update Badge */}
            <XStack
              backgroundColor={isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.15)'}
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius={999}
              alignItems="center"
              gap="$1.5">
              <Ionicons name="sparkles" size={14} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
              <Text
                fontSize="$2"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing={1}
                color={isDarkMode ? '#60a5fa' : '#1d4ed8'}>
                Mandatory Update
              </Text>
            </XStack>

            {/* Emblem / Icon Container */}
            <YStack
              width={76}
              height={76}
              borderRadius={38}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(37, 99, 235, 0.12)'}>
              <Ionicons
                name="arrow-up-circle"
                size={44}
                color={isDarkMode ? '#60a5fa' : '#2563eb'}
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
                Update Required
              </Text>

              <Text
                fontSize="$3"
                color="$color11"
                textAlign="center"
                lineHeight={22}
                maxWidth={320}>
                A newer version of Buddy is required to keep your financial records secure and
                compatible with our latest database architecture.
              </Text>
            </YStack>

            {/* Version Delta Tag */}
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$3"
              backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius={12}>
              <YStack alignItems="center">
                <Text fontSize="$1" color="$color11" textTransform="uppercase">
                  Installed
                </Text>
                <Text fontSize="$3" fontWeight="700" color="$color">
                  v{displayCurrentVersion}
                </Text>
              </YStack>

              <Ionicons name="arrow-forward" size={16} color={isDarkMode ? '#a1a1aa' : '#71717a'} />

              <YStack alignItems="center">
                <Text fontSize="$1" color="$color11" textTransform="uppercase">
                  Required
                </Text>
                <Text fontSize="$3" fontWeight="700" color={isDarkMode ? '#60a5fa' : '#2563eb'}>
                  v{displayRequiredVersion}
                </Text>
              </YStack>
            </XStack>

            {/* What's New Highlights */}
            {displayNotes.length > 0 && (
              <YStack
                width="100%"
                gap="$2"
                backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'}
                padding="$3"
                borderRadius={12}>
                <Text fontSize="$2" fontWeight="700" color="$color" textTransform="uppercase">
                  What’s in this update:
                </Text>
                {displayNotes.map((note, index) => (
                  <XStack key={index} alignItems="flex-start" gap="$2">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={isDarkMode ? '#34d399' : '#059669'}
                      style={{marginTop: 2}}
                    />
                    <Text fontSize="$3" color="$color11" flex={1} lineHeight={18}>
                      {note}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            )}

            {/* Primary Action Button (min 48pt touch target) */}
            <YStack width="100%" gap="$3" marginTop="$2">
              <Button
                backgroundColor="$blue10"
                color="white"
                borderRadius={14}
                height={50}
                onPress={handleUpdate}
                pressStyle={{opacity: 0.85}}
                accessibilityLabel={`Update Buddy on ${storeLabel}`}>
                <XStack alignItems="center" gap="$2">
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text color="white" fontWeight="700" fontSize="$4">
                    Update on {storeLabel}
                  </Text>
                </XStack>
              </Button>

              {systemStatus.upgrade.hasPendingOtaUpdate && (
                <Button
                  variant="outline"
                  borderColor="$borderColor"
                  color="$color"
                  borderRadius={14}
                  height={50}
                  onPress={handleRestartOta}
                  accessibilityLabel="Restart app to apply pending update">
                  <XStack alignItems="center" gap="$2">
                    <Ionicons
                      name={isApplyingOta ? 'reload' : 'refresh-circle-outline'}
                      size={20}
                      color={isDarkMode ? '#60a5fa' : '#2563eb'}
                    />
                    <Text color="$color" fontWeight="600" fontSize="$3">
                      {isApplyingOta ? 'Applying Update…' : 'Restart App to Apply Update'}
                    </Text>
                  </XStack>
                </Button>
              )}
            </YStack>
          </YStack>
        </GlassSurface>
      </YStack>
    </ScreenContainer>
  );
};

export default ForceUpgradeScreen;
