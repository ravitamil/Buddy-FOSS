import React from 'react';
import {YStack} from 'tamagui';

import {
  AddEditLoanAdditionalChargesSection,
  AddEditLoanCalculatedValuesSection,
  AddEditLoanRemindersSection,
} from './AddEditLoanSupportSections';
import {
  AddEditLoanBasicInfoSection,
  AddEditLoanInterestSection,
  AddEditLoanLenderSection,
  AddEditLoanPayoffSection,
} from './addEditLoan/AddEditLoanPrimarySections';
import type {UseAddEditLoanScreenResult} from '../hooks/useAddEditLoanScreen';

interface AddEditLoanSectionsProps {
  screen: UseAddEditLoanScreenResult;
}

export const AddEditLoanSections = ({screen}: AddEditLoanSectionsProps) => {
  return (
    <YStack gap="$3">
      <AddEditLoanBasicInfoSection screen={screen} />
      <AddEditLoanInterestSection screen={screen} />
      <AddEditLoanPayoffSection screen={screen} />
      <AddEditLoanLenderSection screen={screen} />
      {screen.hasCalculatedValues ? <AddEditLoanCalculatedValuesSection screen={screen} /> : null}
      <AddEditLoanAdditionalChargesSection screen={screen} />
      <AddEditLoanRemindersSection screen={screen} />
    </YStack>
  );
};
