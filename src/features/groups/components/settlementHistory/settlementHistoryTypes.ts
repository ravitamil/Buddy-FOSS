import type React from 'react';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {SettlementSuggestion, Transaction} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';

export type SettlementIconName = React.ComponentProps<typeof Ionicons>['name'];

export interface SharedSettlementProps {
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
}

export interface QuickSettleProps extends SharedSettlementProps {
  suggestions: SettlementSuggestion[];
  accessibilityLabel: string;
  onSettle: (suggestion: SettlementSuggestion) => void;
}

export interface SummaryProps extends SharedSettlementProps {
  paymentsCount: number;
  totalSettled: number;
  outstandingAmount: number;
}

export interface HistoryProps extends SharedSettlementProps {
  group: EnhancedGroup;
  settlementTransactions: Transaction[];
  accessibilityLabel: string;
  userFirstName?: string;
  getUserDisplayName: () => string;
  onRecordPayment: () => void;
}

export interface StatItemProps {
  icon: SettlementIconName;
  iconColor: string;
  iconBackgroundColor: string;
  label: string;
  value: string | number;
  valueColor?: string;
}

export interface SettlementTransactionCardProps extends SharedSettlementProps {
  group: EnhancedGroup;
  transaction: Transaction;
  userFirstName?: string;
  getUserDisplayName: () => string;
}

export interface SettledDebt {
  description: string;
  amount: number;
}
