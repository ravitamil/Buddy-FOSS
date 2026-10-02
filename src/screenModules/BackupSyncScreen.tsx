import React from 'react';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {BackupSyncContent, useBackupSyncScreen} from '@/features/settings';
import {logger as appLogger} from '@/services/LoggerService';

const BackupSyncScreen = () => {
  appLogger.debug('BackupSyncScreen: Component rendering started');

  const screen = useBackupSyncScreen();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Backup & Sync"
        showBackButton={true}
        onBackPress={screen.navigateBack}
        largeTitle="Backup & Sync"
        {...screen.headerProps}
      />

      <BackupSyncContent screen={screen} />
    </ScreenContainer>
  );
};

export default BackupSyncScreen;
