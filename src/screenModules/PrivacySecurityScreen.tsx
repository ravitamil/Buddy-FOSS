import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {router} from 'expo-router';
import Animated from 'react-native-reanimated';

import {
  AutoLockTimeoutSheet,
  DataManagementSection,
  DeleteDataConfirmationModal,
  DeleteDataLoadingOverlay,
  PrivacyInformationSection,
  PrivacySettingsSection,
  usePrivacySecurityScreen,
} from '@/features/settings';
import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '../components/ui';
import {useProgressiveBlurHeader} from '../hooks/useProgressiveBlurHeader';

const PrivacySecurityScreen = () => {
  const {onScroll, headerProps} = useProgressiveBlurHeader();
  const screen = usePrivacySecurityScreen();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <DeleteDataLoadingOverlay screen={screen} />

      <CustomNavigationHeader
        title="Privacy & Security"
        subtitle="PROTECT YOUR DATA"
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
          contentContainerStyle={{paddingTop: 118}}>
          <VStack flex={1} padding="$4" gap="$4" paddingBottom="$8">
            <PrivacySettingsSection screen={screen} />
            <DataManagementSection screen={screen} />
            <PrivacyInformationSection screen={screen} />
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>

      <AutoLockTimeoutSheet screen={screen} />
      <DeleteDataConfirmationModal screen={screen} />
    </ScreenContainer>
  );
};

export default PrivacySecurityScreen;
