import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import type {ImageSourcePropType} from 'react-native';

import type {Category, MemberBalance, SettlementSuggestion, Transaction} from '@/types';
import type {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';

export type GroupTransactionFilter = 'all' | 'paid_by_me' | 'my_share';

export interface CategoryAnalysis {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
}

export interface GroupDetailStats {
  totalExpenses: number;
  totalPayments: number;
  totalAmount: number;
  totalReceived: number;
  perPersonShare: number;
  memberCount: number;
  transactionCount: number;
  memberBalances: MemberBalance[];
  topExpenseCategories: CategoryAnalysis[];
  monthlyTrends: MonthlyTrend[];
  settlementSuggestions: SettlementSuggestion[];
  currentUserBalance: number;
  debtMatrix: Record<string, Record<string, number>>;
  lastActivityDate: Date;
}

export interface GroupDetailMemberWithAvatarUrl extends EnhancedGroupMember {
  avatarUrl?: string;
}

export interface GroupDetailMemberViewModel {
  member: GroupDetailMemberWithAvatarUrl;
  avatarUri?: string;
  isCurrentUser: boolean;
  balance: number;
  statusColor: string;
  hasStatus: boolean;
}

export interface GroupDetailBalanceViewModel {
  oweAmount: number;
  owedAmount: number;
  totalPaidByCurrentUser: number;
  currentUserShare: number;
  isActuallySettled: boolean;
  isPositive: boolean;
  isBalanced: boolean;
  shouldShowSettleCta: boolean;
}

export type GroupTransactionImpactType = 'lent' | 'borrowed' | 'received' | 'paid' | 'neutral';

export interface GroupDetailTransactionItem {
  id: string;
  description: string;
  amount: number;
  totalAmount: number;
  netAmount: number;
  impactType: GroupTransactionImpactType;
  impactLabel: string;
  date: string;
  type: 'income' | 'expense';
  category: {
    name: string;
    icon: string;
    color: string;
  };
  subtitle: string;
  payerName?: string;
  groupName?: string | null;
  isSettlement: boolean;
  settlementStatus?: 'settled' | 'unsettled' | 'partial';
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  groupEmoji?: string;
}

export interface UseGroupDetailScreenResult {
  group: EnhancedGroup | null;
  isDeleting: boolean;
  isDeletedPlaceholder: boolean;
  isActionSheetOpen: boolean;
  isMembersSheetOpen: boolean;
  transactionFilter: GroupTransactionFilter;
  stats: GroupDetailStats;
  memberItems: GroupDetailMemberViewModel[];
  balanceViewModel: GroupDetailBalanceViewModel;
  filteredTopTransactions: Transaction[];
  nudging: Record<string, boolean>;
  title: string;
  subtitle: string;
  isDarkMode: boolean;
  profilePictureUri?: string;
  userId?: string;
  currentUserDisplayName: string;
  formatCurrency: (amount: number) => string;
  scrollY: import('react-native-reanimated').SharedValue<number>;
  onScroll: ReturnType<
    typeof import('@/hooks/useProgressiveBlurHeader').useScrollDirection
  >['onScroll'];
  isScrollingDown: import('react-native-reanimated').SharedValue<boolean>;
  resetScrollDirection: () => void;
  setTransactionFilter: (filter: GroupTransactionFilter) => void;
  setActionSheetOpen: (open: boolean) => void;
  setMembersSheetOpen: (open: boolean) => void;
  navigateBack: () => void;
  navigateAddMember: () => void;
  navigateAddTransaction: () => void;
  navigateInsights: () => void;
  navigateActivity: () => void;
  navigateSettlementHistory: () => void;
  navigateAllTransactions: () => void;
  navigateTransaction: (transactionId: string) => void;
  navigateEditGroup: () => void;
  navigateSettleSuggestion: (suggestion: SettlementSuggestion) => void;
  handleDeleteGroup: () => void;
  handleNudgeSuggestion: (suggestion: SettlementSuggestion) => void;
  handleInviteSuggestion: (suggestion: SettlementSuggestion) => void;
  getInitials: (name: string) => string;
  getTransactionItem: (transaction: Transaction) => GroupDetailTransactionItem | null;
}

export interface CategoryLike {
  name?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export interface TransactionWithCategoryObject extends Omit<Transaction, 'category'> {
  category: string | CategoryLike;
}

export interface GroupDetailSectionsProps {
  group: EnhancedGroup;
  stats: GroupDetailStats;
  memberItems: GroupDetailMemberViewModel[];
  balanceViewModel: GroupDetailBalanceViewModel;
  filteredTopTransactions: Transaction[];
  transactionFilter: GroupTransactionFilter;
  nudging: Record<string, boolean>;
  isDarkMode: boolean;
  profilePictureUri?: string;
  userId?: string;
  currentUserDisplayName: string;
  formatCurrency: (amount: number) => string;
  onSetFilter: (filter: GroupTransactionFilter) => void;
  onAddMember: () => void;
  onOpenMembersSheet: () => void;
  onAddTransaction: () => void;
  onInsights: () => void;
  onAllTransactions: () => void;
  onTransactionPress: (transactionId: string) => void;
  onSettleSuggestion: (suggestion: SettlementSuggestion) => void;
  onNudgeSuggestion: (suggestion: SettlementSuggestion) => void;
  onInviteSuggestion: (suggestion: SettlementSuggestion) => void;
  getInitials: (name: string) => string;
  getTransactionItem: (transaction: Transaction) => GroupDetailTransactionItem | null;
}

export interface GroupDetailActionSheetProps {
  group: EnhancedGroup;
  isOpen: boolean;
  isDarkMode: boolean;
  onOpenChange: (open: boolean) => void;
  onInsights: () => void;
  onActivity: () => void;
  onSettlementHistory: () => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
}

export interface GroupDetailDeletingOverlayProps {
  isVisible: boolean;
  isDarkMode: boolean;
  loadingSource: ImageSourcePropType;
}

export type GroupDetailIconName = keyof typeof Ionicons.glyphMap;

export interface SplitDetailWithUserId {
  memberId: string;
  userId?: string;
}

export type GroupDetailCategory = Category;
