import type React from 'react';
import type {ScrollView} from 'react-native';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import type {BudgetData} from '@/features/budgets/components/BudgetPlanningCard';
import type {GroupCardProps} from '@/features/groups/components/GroupCard';
import type {TransactionItemProps} from '@/features/transactions/components/TransactionItem';

export type HomeStatType = 'income' | 'expense' | 'investment';
export type HomeStatTrend = 'positive' | 'negative' | 'neutral';

export interface HomeStatCardViewModel {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  percentage: string;
  percentageColor: string;
  percentageIcon?: keyof typeof Ionicons.glyphMap;
  trend?: HomeStatTrend;
  type: HomeStatType;
  onPress: () => void;
  onDoublePress?: () => void;
}

export interface HomeGroupCardViewModel {
  id: string;
  name: string;
  props: GroupCardProps;
}

export type HomeTransactionViewModel = Omit<TransactionItemProps, 'formatCurrency'>;

export interface HomeScreenModel {
  scrollViewRef: React.RefObject<ScrollView | null>;
  isLoading: boolean;
  isDarkMode: boolean;
  greetingName: string;
  isPro: boolean;
  iconColor: string;
  linkIconColor: string;
  statCards: HomeStatCardViewModel[];
  budgetData: BudgetData;
  groupCards: HomeGroupCardViewModel[];
  transactions: HomeTransactionViewModel[];
  formatCurrency: (amount: number) => string;
  actions: {
    scrollToTop: () => void;
    openProfile: () => void;
    openNotifications: () => void;
    openAnalytics: () => void;
    openTransactions: () => void;
    editBudget: () => void;
    viewBudgetDetails: () => void;
    setupBudget: () => void;
    openDebtPayoff: () => void;
    openRetirement: () => void;
    openNetWorth: () => void;
    openGroups: () => void;
    addGroup: () => void;
    addTransaction: () => void;
  };
}
