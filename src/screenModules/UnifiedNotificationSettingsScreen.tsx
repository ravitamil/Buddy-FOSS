import React from 'react';
import {router} from 'expo-router';
import Animated from 'react-native-reanimated';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {VStack} from '@ravitamil/buddy-ui';
import {
  BudgetAlertsSection,
  GroupNotificationsSection,
  NotificationActionsSection,
  NotificationPermissionsSection,
  NotificationScheduleInfoSection,
  PaymentRemindersSection,
  UnifiedNotificationSettingsSheets,
} from '@/features/settings/components/UnifiedNotificationSettingsSections';
import {useUnifiedNotificationSettingsScreen} from '@/features/settings/hooks/useUnifiedNotificationSettingsScreen';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';

const UnifiedNotificationSettingsScreen = () => {
  const screen = useUnifiedNotificationSettingsScreen();
  const {onScroll, headerProps} = useProgressiveBlurHeader();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Notifications"
        subtitle="MANAGE YOUR ALERTS"
        onBackPress={() => router.back()}
        mode="collapsing"
        {...headerProps}
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <Animated.ScrollView
          style={{flex: 1, backgroundColor: 'transparent'}}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentContainerStyle={{paddingTop: 118, paddingBottom: 60}}>
          <VStack padding="$4" gap="$4">
            <NotificationPermissionsSection screen={screen} />
            <NotificationActionsSection screen={screen} />
            <PaymentRemindersSection screen={screen} />
            <BudgetAlertsSection screen={screen} />
            <GroupNotificationsSection screen={screen} />
            <NotificationScheduleInfoSection screen={screen} />
          </VStack>
        </Animated.ScrollView>

        <UnifiedNotificationSettingsSheets screen={screen} />
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default UnifiedNotificationSettingsScreen;
