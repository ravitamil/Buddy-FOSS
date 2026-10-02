import {FloatingAction} from '@ravitamil/buddy-ui';
import React from 'react';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {
  ProfileSettingsContent,
  ProfileSettingsLoadingState,
  useProfileSettingsScreen,
} from '@/features/settings';

const ProfileSettingsScreen = () => {
  const screen = useProfileSettingsScreen();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']} ignoreBottomSafeArea>
      <CustomNavigationHeader
        title="Profile Settings"
        subtitle="Update your personal information"
        onBackPress={screen.navigateBack}
        mode="collapsing"
        showProBadge
        {...screen.headerProps}
      />

      {screen.isInitialLoading ? (
        <ProfileSettingsLoadingState />
      ) : (
        <ProfileSettingsContent screen={screen} />
      )}

      <FloatingAction
        presentation="save"
        onPress={() => void screen.handleSave()}
        loading={screen.isLoading}
        disabled={screen.isLoading}
        label="Save Profile"
      />
    </ScreenContainer>
  );
};

export default ProfileSettingsScreen;
