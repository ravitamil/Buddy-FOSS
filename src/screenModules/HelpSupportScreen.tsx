import React from 'react';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {
  HelpSupportContactSheet,
  HelpSupportContent,
  useHelpSupportScreen,
} from '@/features/settings';

const HelpSupportScreen = () => {
  const screen = useHelpSupportScreen();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Help & Support"
        subtitle="We're here to help you"
        onBackPress={screen.navigateBack}
        largeTitle="Help & Support"
        {...screen.headerProps}
      />

      <HelpSupportContent screen={screen} />
      <HelpSupportContactSheet screen={screen} />
    </ScreenContainer>
  );
};

export default HelpSupportScreen;
