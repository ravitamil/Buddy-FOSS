import React from 'react';
import {YStack, styled} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {ActiveNotificationsContent} from '@/features/settings/components/ActiveNotificationsSections';
import {useActiveNotificationsScreen} from '@/features/settings/hooks/useActiveNotificationsScreen';

const MarkAllReadButton = styled(YStack, {
  name: 'ActiveNotificationsMarkAllReadButton',
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$blue2',
  pressStyle: {
    opacity: 0.7,
    scale: 0.98,
  },
});

const ActiveNotificationsScreen = () => {
  const screen = useActiveNotificationsScreen();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Active Notifications"
        subtitle="STAY UPDATED"
        onBackPress={screen.navigateBack}
        mode="collapsing"
        {...screen.headerProps}
        rightElement={
          screen.notifications.length > 0 ? (
            <MarkAllReadButton
              onPress={() => void screen.markAllAsRead()}
              accessibilityRole="button"
              theme={screen.isDarkMode ? 'dark' : 'light'}>
              <Ionicons name="checkmark-done" size={20} color="#2196F3" />
            </MarkAllReadButton>
          ) : null
        }
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false}>
        <ActiveNotificationsContent screen={screen} />
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default ActiveNotificationsScreen;
