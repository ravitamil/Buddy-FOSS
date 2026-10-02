import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {View} from 'tamagui';

import StandardFlashList from '@/components/ui/StandardFlashList';
import {GroupInsightsDebtCard, GroupInsightsMemberSummaryCard} from '../GroupInsightsCards';
import {renderEmptyState} from './GroupInsightsSectionShared';
import type {DebtsProps, MembersProps} from './groupInsightsSectionTypes';

export const GroupInsightsDebtsSection: React.FC<DebtsProps> = ({
  group,
  debtList,
  isDarkMode,
  userFirstName,
  getUserDisplayName,
  onSettleDebt,
}) => (
  <VStack gap="$3">
    <Text variant="h4" color="$text" weight="bold">
      Optimal Settlement Plan
    </Text>

    {debtList.length === 0 ? (
      renderEmptyState(
        group.transactions.length === 0 ? 'No expenses yet' : 'All Settled!',
        group.transactions.length === 0
          ? 'Add expenses to see settlement suggestions'
          : 'No pending settlements. All group members are even.',
        group.transactions.length === 0 ? 'receipt-outline' : 'checkmark-circle',
      )
    ) : (
      <>
        <Text variant="body2" color="$textSecondary" marginBottom="$3">
          Settle these {debtList.length} payment{debtList.length !== 1 ? 's' : ''} to balance the
          group:
        </Text>
        <StandardFlashList
          data={debtList}
          keyExtractor={(_, index) => `debt-${index}`}
          renderItem={({item: debt}) => (
            <GroupInsightsDebtCard
              debt={debt}
              onSettle={() => onSettleDebt(debt)}
              isDarkMode={isDarkMode}
              userFirstName={userFirstName}
              getUserDisplayName={getUserDisplayName}
            />
          )}
          ItemSeparatorComponent={() => <View style={{height: 12}} />}
          scrollEnabled={false}
        />
      </>
    )}
  </VStack>
);

export const GroupInsightsMembersSection: React.FC<MembersProps> = ({
  memberBalances,
  memberAvatars,
  isDarkMode,
  userFirstName,
  getUserDisplayName,
  onViewMemberDetails,
}) => (
  <VStack gap="$3">
    <Text variant="h4" color="$text" weight="bold">
      Member Balances
    </Text>
    <Text variant="body2" color="$textSecondary" marginBottom="$2">
      Individual member spending and balance details:
    </Text>
    <StandardFlashList
      data={[...memberBalances].sort((a, b) => b.balance - a.balance)}
      keyExtractor={(item) => `member-${item.memberId}`}
      renderItem={({item: member}) => (
        <GroupInsightsMemberSummaryCard
          member={member}
          avatar={memberAvatars[member.memberId]}
          onViewDetails={() => onViewMemberDetails(member)}
          isDarkMode={isDarkMode}
          userFirstName={userFirstName}
          getUserDisplayName={getUserDisplayName}
        />
      )}
      ItemSeparatorComponent={() => <View style={{height: 12}} />}
      scrollEnabled={false}
    />
  </VStack>
);
