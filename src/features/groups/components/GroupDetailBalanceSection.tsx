import React from 'react';

import type {GroupDetailSectionsProps} from '../types/groupDetailScreen';
import {GroupBalanceSummaryCard} from './groupDetailBalance/GroupBalanceSummaryCard';
import {GroupMemberStrip} from './groupDetailBalance/GroupMemberStrip';

export type GroupDetailBalanceProps = Pick<
  GroupDetailSectionsProps,
  | 'group'
  | 'stats'
  | 'memberItems'
  | 'balanceViewModel'
  | 'isDarkMode'
  | 'formatCurrency'
  | 'onAddMember'
  | 'onOpenMembersSheet'
  | 'onInsights'
  | 'getInitials'
>;

export const GroupDetailBalanceSection: React.FC<GroupDetailBalanceProps> = (props) => (
  <>
    <GroupBalanceSummaryCard {...props} />
    <GroupMemberStrip {...props} />
  </>
);
