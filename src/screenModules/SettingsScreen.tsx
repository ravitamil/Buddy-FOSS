import React from 'react';
import Animated from 'react-native-reanimated';
import {YStack} from 'tamagui';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  SettingsDangerZone,
  SettingsDeleteAccountSheet,
  SettingsDetailsSection,
  SettingsLargeTitle,
  SettingsLoadingOverlay,
  SettingsModal,
  SettingsProfileCard,
  SettingsQuickSettings,
  useSettingsScreen,
} from '@/features/settings';

export default function SettingsScreen() {
  const screen = useSettingsScreen();

  return (
    <ScreenContainer
      dotColor={screen.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
      backgroundColor="transparent"
      edges={['top', 'bottom']}>
      <CustomNavigationHeader
        title="Settings"
        subtitle="Customize your experience"
        showBackButton={false}
        largeTitle="Settings"
        showProBadge
        {...screen.headerProps}
      />

      <ScreenWrapper
        scrollable={false}
        useSafeArea={false}
        backgroundColor="transparent"
        padding={false}>
        <Animated.ScrollView
          style={{flex: 1, backgroundColor: 'transparent'}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 120}}
          scrollEventThrottle={16}
          onScroll={screen.onScroll}>
          <YStack flex={1} padding="$4" gap="$4">
            <SettingsLargeTitle screen={screen} />
            <SettingsProfileCard screen={screen} />
            <SettingsQuickSettings screen={screen} />
            <SettingsDetailsSection screen={screen} />
            <SettingsDangerZone screen={screen} />
          </YStack>
        </Animated.ScrollView>

        <SettingsModal screen={screen} />
        <SettingsDeleteAccountSheet screen={screen} />
        <SettingsLoadingOverlay
          isVisible={screen.isDeletingAccount}
          isDarkMode={screen.isDarkMode}
          title="Deleting Account"
          message="Please wait while we securely delete your account and all associated data..."
        />
        <SettingsLoadingOverlay
          isVisible={screen.isSigningOut}
          isDarkMode={screen.isDarkMode}
          title="Signing Out..."
          message="Signing you out securely and redirecting to the sign-in screen..."
          size={140}
        />
      </ScreenWrapper>
    </ScreenContainer>
  );
}
