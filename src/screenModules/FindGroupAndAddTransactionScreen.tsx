import {IconAction} from '@ravitamil/buddy-ui';
import React from 'react';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  FindGroupAndAddTransactionContent,
  useFindGroupAndAddTransactionScreen,
} from '@/features/groups';
import {logger as appLogger} from '@/services/LoggerService';

const FindGroupAndAddTransactionScreen = () => {
  const screen = useFindGroupAndAddTransactionScreen();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <CustomNavigationHeader
        title="Find & Add Transaction"
        subtitle="Search for a group to add expense or payment"
        largeTitle="Find & Add Transaction"
        {...screen.headerProps}
        onBackPress={() => {
          appLogger.debug('FindGroupAndAddTransactionScreen: back button pressed');
          screen.navigateBack();
        }}
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <FindGroupAndAddTransactionContent screen={screen} />
      </ScreenWrapper>

      {screen.selectedGroup ? (
        <IconAction
          onPress={() => {
            void screen.handleSubmit();
          }}
          icon={screen.transactionType === 'expense' ? 'add' : 'checkmark'}
          label={screen.transactionType === 'expense' ? 'Add Expense' : 'Record Payment'}
          tone={screen.transactionType === 'expense' ? 'primary' : 'neutral'}
          disabled={
            !screen.amount || (screen.transactionType === 'expense' && !screen.description.trim())
          }
        />
      ) : null}
    </ScreenContainer>
  );
};

export default FindGroupAndAddTransactionScreen;
