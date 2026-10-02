import React from 'react';

import type {GroupDetailSectionsProps} from '../types/groupDetailScreen';
import {
  GroupSettlementStatsCard,
  GroupSettlementSuggestionsCard,
} from './groupDetailSettlement/GroupSettlementCards';

export type GroupDetailSettlementProps = Pick<
  GroupDetailSectionsProps,
  | 'group'
  | 'stats'
  | 'isDarkMode'
  | 'profilePictureUri'
  | 'userId'
  | 'currentUserDisplayName'
  | 'formatCurrency'
  | 'nudging'
  | 'onInsights'
  | 'onSettleSuggestion'
  | 'onNudgeSuggestion'
  | 'onInviteSuggestion'
  | 'getInitials'
>;

export const GroupDetailSettlementSection: React.FC<GroupDetailSettlementProps> = (props) => (
  <>
    <GroupSettlementStatsCard {...props} />
    <GroupSettlementSuggestionsCard {...props} />
  </>
);
