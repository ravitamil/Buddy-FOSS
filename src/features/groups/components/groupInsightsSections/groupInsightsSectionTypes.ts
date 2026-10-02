import type {GroupMember} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';
import type {GroupBalanceCalculation, MemberBalance} from '@/utils/groupBalanceUtils.optimized';
import type {GroupInsightsDebt, GroupInsightsViewMode} from '../../hooks/useGroupInsightsScreen';

export interface DisplayNameProps {
  userFirstName?: string;
  getUserDisplayName?: () => string;
}

export interface SummaryProps {
  groupBalance: GroupBalanceCalculation;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
  accessibilityLabel: string;
}

export interface ModeToggleProps {
  viewMode: GroupInsightsViewMode;
  debtsCount: number;
  membersCount: number;
  isDarkMode: boolean;
  onChange: (mode: GroupInsightsViewMode) => void;
}

export interface DebtsProps extends DisplayNameProps {
  group: EnhancedGroup;
  debtList: GroupInsightsDebt[];
  isDarkMode: boolean;
  onSettleDebt: (debt: GroupInsightsDebt) => void;
}

export interface MembersProps extends DisplayNameProps {
  memberBalances: MemberBalance[];
  memberAvatars: Record<string, string>;
  isDarkMode: boolean;
  onViewMemberDetails: (member: MemberBalance) => void;
}

export interface AnalyticsProps extends DisplayNameProps {
  group: EnhancedGroup;
  groupBalance: GroupBalanceCalculation;
  expenseDistributionA11y: string;
  spendingTrendsA11y: string;
  categorySpendingA11y: string;
  settlementTimelineA11y: string;
}

export type AnalyticsGroupMember = GroupMember;
