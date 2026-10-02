import React from 'react';

import type {UseAddGroupTransactionScreenResult} from '../hooks/useAddGroupTransactionScreen';
import type {UseEditGroupTransactionScreenResult} from '../hooks/useEditGroupTransactionScreen';
import {
  GroupTransactionPaidBySection,
  GroupTransactionSplitMethodSection,
} from './GroupTransactionMemberControls';

type GroupTransactionMemberScreen =
  | UseAddGroupTransactionScreenResult
  | UseEditGroupTransactionScreenResult;

interface GroupTransactionMemberSectionsLayoutProps {
  screen: GroupTransactionMemberScreen;
  paidByVariant: 'avatar' | 'initials';
  getAvatarColor?: (name: string) => string;
  showSplitSection?: boolean;
  splitSectionFooter?: React.ReactNode;
}

export const GroupTransactionMemberSectionsLayout = ({
  screen,
  paidByVariant,
  getAvatarColor,
  showSplitSection = true,
  splitSectionFooter,
}: GroupTransactionMemberSectionsLayoutProps) => {
  if (!screen.group) {
    return null;
  }

  return (
    <>
      <GroupTransactionPaidBySection
        group={screen.group}
        paidBy={screen.paidBy}
        isDarkMode={screen.isDarkMode}
        userFirstName={screen.userFirstName}
        getUserDisplayName={screen.getUserDisplayName}
        setPaidBy={screen.setPaidBy}
        variant={paidByVariant}
        getAvatarColor={getAvatarColor}
      />
      {showSplitSection ? (
        <GroupTransactionSplitMethodSection
          group={screen.group}
          amount={screen.amount}
          paidBy={screen.paidBy}
          splitType={screen.splitType}
          customAmounts={screen.customAmounts}
          percentageAmounts={screen.percentageAmounts}
          sharesAmounts={screen.sharesAmounts}
          currencySymbol={screen.currencySymbol}
          isDarkMode={screen.isDarkMode}
          userFirstName={screen.userFirstName}
          settingsFormatCurrencyExact={screen.settingsFormatCurrencyExact}
          getUserDisplayName={screen.getUserDisplayName}
          setPaidBy={screen.setPaidBy}
          setSplitType={screen.setSplitType}
          setCustomAmounts={screen.setCustomAmounts}
          setPercentageAmounts={screen.setPercentageAmounts}
          setSharesAmounts={screen.setSharesAmounts}>
          {splitSectionFooter}
        </GroupTransactionSplitMethodSection>
      ) : null}
    </>
  );
};
