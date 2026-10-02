import type {ComponentProps} from 'react';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import type {DebtPayoffStrategy} from '@/types/debt.types';
import type {DebtPayoffScreenState} from '../../hooks/useDebtPayoffScreen';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];
export type FormatCurrency = (amount: number) => string;

export type DebtPayoffContentProps = Pick<
  DebtPayoffScreenState,
  | 'activeLoans'
  | 'chartData'
  | 'currencySymbol'
  | 'debtPayoffPlan'
  | 'extraPayment'
  | 'formatCurrency'
  | 'isDarkMode'
  | 'isGenerating'
  | 'onScroll'
  | 'selectedStrategy'
  | 'handleApplyStrategy'
  | 'setExtraPayment'
  | 'setSelectedStrategy'
>;

export interface DebtPayoffEmptyStateProps {
  isDarkMode: boolean;
  onAddLoan: () => void;
  onBack: () => void;
}

export interface DebtPayoffStrategyOption {
  id: DebtPayoffStrategy;
  name: string;
  description: string;
  icon: IoniconName;
}
