import {FloatingAction} from '@ravitamil/buddy-ui';
import React from 'react';
import {router} from 'expo-router';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import {
  AddEditSubscriptionSections,
  AddEditSubscriptionSheets,
  useAddEditSubscriptionScreen,
} from '@/features/subscriptions';

const AddEditSubscriptionScreen = () => {
  appLogger.debug('AddEditSubscriptionScreen: Component rendering started');

  const {isDarkMode} = useTamaguiTheme();
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});
  const screen = useAddEditSubscriptionScreen();

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
        <ScreenWrapper
          edges={[]}
          backgroundColor="transparent"
          padding={false}
          keyboardMode="aware-scroll"
          onScroll={onScroll}
          keyboardBottomOffset={60}
          bounces
          contentContainerStyle={{
            paddingTop: 100,
            paddingBottom: 160,
            flexGrow: 1,
          }}>
          <AddEditSubscriptionSections screen={screen} isDarkMode={isDarkMode} />
        </ScreenWrapper>

        <FloatingAction
          presentation="save"
          onPress={() => {
            void screen.handleSave();
          }}
          disabled={
            screen.loading || !screen.formData.name.trim() || !screen.formData.amount.trim()
          }
          loading={screen.loading}
        />

        <CustomNavigationHeader
          title={screen.isEditing ? 'Edit Subscription' : 'Add Subscription'}
          subtitle={
            screen.isEditing ? 'Update your subscription details' : 'Track your recurring expenses'
          }
          mode="collapsing"
          {...headerProps}
          onBackPress={() => router.back()}
        />

        <AddEditSubscriptionSheets screen={screen} isDarkMode={isDarkMode} />
      </ScreenContainer>
    </GestureHandlerRootView>
  );
};

export default AddEditSubscriptionScreen;
