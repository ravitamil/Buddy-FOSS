/**
 * System Screens Gallery
 *
 * Developer & test preview screen to inspect all system and error screens:
 * - Service Unavailable / Scheduled Maintenance
 * - Force Upgrade (Mandatory Update)
 * - Network Offline (with Lottie Animation)
 * - Fatal System Error (ErrorBoundary fallback)
 * - Feature Unavailable / Killswitch
 *
 * Also allows live simulation of blocking states via AppSystemStatusProvider.
 */

import React, {useState} from 'react';
import {YStack, XStack, ScrollView} from 'tamagui';
import {Button, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {router} from 'expo-router';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {CustomNavigationHeader} from '@/components/ui/CustomNavigationHeader';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAppSystemStatus} from '@/features/systemStatus/AppSystemStatusProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

const CrashTriggerComponent: React.FC<{shouldCrash: boolean}> = ({shouldCrash}) => {
  if (shouldCrash) {
    throw new Error('This is a simulated crash triggered from the System Screens Gallery!');
  }
  return null;
};

export const SystemScreensGalleryScreen: React.FC = () => {
  const {isDarkMode} = useTamaguiTheme();
  const systemStatus = useAppSystemStatus();
  const [shouldCrash, setShouldCrash] = useState(false);

  const screens = [
    {
      id: 'maintenance',
      title: 'Service Unavailable',
      description: 'Scheduled maintenance, 503 response, or backend downtime.',
      route: '/service-unavailable' as const,
      icon: 'construct' as const,
      iconColor: isDarkMode ? '#fbbf24' : '#d97706',
      bgColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(251, 191, 36, 0.2)',
      badge: 'Maintenance',
    },
    {
      id: 'force-upgrade',
      title: 'Forced Upgrade',
      description: 'Mandatory minimum version update required from store.',
      route: '/force-upgrade' as const,
      icon: 'sparkles' as const,
      iconColor: isDarkMode ? '#60a5fa' : '#2563eb',
      bgColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.15)',
      badge: 'Mandatory Update',
    },
    {
      id: 'network-offline',
      title: 'Network Offline',
      description: 'No internet connection with animated Lottie visual.',
      route: '/network-unavailable' as const,
      icon: 'cloud-offline' as const,
      iconColor: isDarkMode ? '#f87171' : '#dc2626',
      bgColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)',
      badge: 'Offline State',
    },
    {
      id: 'system-error',
      title: 'System Error Fallback',
      description: 'Unhandled React exception caught by ErrorBoundary.',
      route: '/system-error' as const,
      icon: 'warning' as const,
      iconColor: isDarkMode ? '#f87171' : '#b91c1c',
      bgColor: isDarkMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.1)',
      badge: 'Crash Boundary',
    },
    {
      id: 'feature-unavailable',
      title: 'Feature Under Maintenance',
      description: 'Specific module disabled or restricted via feature controls.',
      route: '/feature-unavailable' as const,
      icon: 'lock-closed' as const,
      iconColor: isDarkMode ? '#c084fc' : '#9333ea',
      bgColor: isDarkMode ? 'rgba(192, 132, 252, 0.15)' : 'rgba(147, 51, 234, 0.15)',
      badge: 'Feature Control',
    },
  ];

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} showDots={true}>
      <CustomNavigationHeader
        title="System Screens"
        subtitle="Preview and test system error states"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" padding="$4" paddingBottom="$8">
          {/* Header Explanation Card */}
          <GlassSurface padding="$4" borderRadius={16}>
            <XStack alignItems="center" gap="$3">
              <Ionicons
                name="color-palette-outline"
                size={28}
                color={isDarkMode ? '#60a5fa' : '#2563eb'}
              />
              <YStack flex={1} gap="$1">
                <Text fontSize="$4" fontWeight="700" color="$color">
                  Fluid Surface System Screens
                </Text>
                <Text fontSize="$2" color="$color11" lineHeight={18}>
                  Tap any card below to launch and inspect the screen in full-screen mode, or use
                  the simulation toggles to test app guards.
                </Text>
              </YStack>
            </XStack>
          </GlassSurface>

          {/* Screen Cards List */}
          <Text fontSize="$4" fontWeight="700" color="$color" marginTop="$2">
            Screen Previews
          </Text>

          {screens.map((item) => (
            <YStack
              key={item.id}
              accessibilityRole="button"
              onPress={() => router.push(item.route)}
              pressStyle={{opacity: 0.85}}>
              <GlassSurface padding="$4" borderRadius={16}>
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$3" flex={1}>
                    <YStack
                      width={48}
                      height={48}
                      borderRadius={24}
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor={item.bgColor}>
                      <Ionicons name={item.icon} size={24} color={item.iconColor} />
                    </YStack>

                    <YStack flex={1} gap="$1">
                      <XStack alignItems="center" gap="$2">
                        <Text fontSize="$4" fontWeight="700" color="$color">
                          {item.title}
                        </Text>
                        <XStack
                          backgroundColor={item.bgColor}
                          paddingHorizontal="$2"
                          paddingVertical="$0.5"
                          borderRadius={6}>
                          <Text fontSize="$1" fontWeight="600" color={item.iconColor}>
                            {item.badge}
                          </Text>
                        </XStack>
                      </XStack>
                      <Text fontSize="$2" color="$color11" numberOfLines={2}>
                        {item.description}
                      </Text>
                    </YStack>
                  </XStack>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDarkMode ? '#71717a' : '#a1a1aa'}
                  />
                </XStack>
              </GlassSurface>
            </YStack>
          ))}

          {/* Interactive Simulation Panel */}
          <Text fontSize="$4" fontWeight="700" color="$color" marginTop="$4">
            Live Guard Simulation
          </Text>

          <GlassSurface padding="$4" borderRadius={16}>
            <YStack gap="$3">
              <Text fontSize="$3" color="$color11">
                Test how the app reacts when system conditions change:
              </Text>

              <XStack gap="$2" flexWrap="wrap">
                <Button
                  size="small"
                  variant="outline"
                  borderColor="$borderColor"
                  onPress={() => {
                    systemStatus.overrideStatus?.({forceUpgrade: true});
                  }}>
                  <Text fontSize="$2" color="$color">
                    Trigger Force Upgrade
                  </Text>
                </Button>

                <Button
                  size="small"
                  variant="outline"
                  borderColor="$borderColor"
                  onPress={() => {
                    systemStatus.overrideStatus?.({serviceStatus: 'maintenance'});
                  }}>
                  <Text fontSize="$2" color="$color">
                    Trigger Maintenance
                  </Text>
                </Button>

                <Button
                  size="small"
                  variant="outline"
                  borderColor="$red8"
                  onPress={() => {
                    setShouldCrash(true);
                  }}>
                  <Text fontSize="$2" color="$red10">
                    Trigger ErrorBoundary Crash
                  </Text>
                </Button>
              </XStack>

              <Button
                backgroundColor="$blue10"
                color="white"
                size="small"
                borderRadius={10}
                marginTop="$2"
                onPress={() => {
                  systemStatus.clearOverrides?.();
                  systemStatus.setOfflineBypass(false);
                  setShouldCrash(false);
                }}>
                <Text color="white" fontWeight="600" fontSize="$2">
                  Reset All Overrides
                </Text>
              </Button>

              {/* Embedded ErrorBoundary crash tester */}
              <ErrorBoundary>
                <CrashTriggerComponent shouldCrash={shouldCrash} />
              </ErrorBoundary>
            </YStack>
          </GlassSurface>
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
};

export default SystemScreensGalleryScreen;
