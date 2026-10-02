import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import {getFontFamilyForWeight} from '@/utils/fonts';
import type {UseGroupTransactionDetailScreenResult} from '../hooks/useGroupTransactionDetailScreen';
import {
  GroupMembersSection,
  GroupTransactionOverview,
  ReceiptSection,
  SplitDetailsSection,
} from './groupTransactionDetail/GroupTransactionDetailCards';
import {
  ActionButtonsSection,
  SettlementDetailsSection,
} from './groupTransactionDetail/GroupTransactionDetailActions';

interface GroupTransactionDetailSectionsProps {
  screen: UseGroupTransactionDetailScreenResult;
}

export const GroupTransactionDetailSections = ({screen}: GroupTransactionDetailSectionsProps) => {
  const group = screen.group;
  if (!group) return null;

  return (
    <>
      <Animated.View style={screen.largeTitleStyle}>
        <VStack>
          <Text
            fontSize={28}
            fontWeight="700"
            color={screen.isDarkMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'}
            marginTop={0}
            letterSpacing={-0.5}
            paddingLeft={2}
            fontFamily={getFontFamilyForWeight('bold')}>
            Transaction Details
          </Text>
          <Text
            fontSize={11}
            fontWeight="600"
            color={screen.isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
            paddingTop={2}
            paddingLeft={4}
            textTransform="uppercase"
            letterSpacing={0.5}
            fontFamily={getFontFamilyForWeight('semibold')}>
            {`${group.emoji || '\uD83D\uDC65'} ${group.name}`}
          </Text>
        </VStack>
      </Animated.View>

      <GroupTransactionOverview screen={screen} />
      <SplitDetailsSection screen={screen} />
      <GroupMembersSection screen={screen} />
      <ReceiptSection screen={screen} />
      <SettlementDetailsSection screen={screen} />
      <ActionButtonsSection screen={screen} />
    </>
  );
};
