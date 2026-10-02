import type {
  GroupSplitType,
  GroupTransactionType,
  IoniconName,
} from '../../types/addGroupTransaction';

export type FindGroupOptionColor = 'red' | 'green' | 'purple' | 'warning' | 'blue';

export interface TransactionTypeOption {
  type: GroupTransactionType;
  icon: IoniconName;
  label: string;
  color: Extract<FindGroupOptionColor, 'red' | 'green'>;
  accessibilityLabel: string;
  accessibilityHint: string;
}

export interface SplitTypeOption {
  type: GroupSplitType;
  icon: IoniconName;
  label: string;
  color: Extract<FindGroupOptionColor, 'purple' | 'warning' | 'blue' | 'green'>;
}

export const transactionTypeOptions: TransactionTypeOption[] = [
  {
    type: 'expense',
    icon: 'cash-outline',
    label: 'Group Expense',
    color: 'red',
    accessibilityLabel: 'Group Expense',
    accessibilityHint: 'Split a shared expense among members',
  },
  {
    type: 'payment',
    icon: 'card-outline',
    label: 'Payment',
    color: 'green',
    accessibilityLabel: 'Payment',
    accessibilityHint: 'Record a payment to settle debts',
  },
];

export const splitTypeOptions: SplitTypeOption[] = [
  {type: 'equal', icon: 'people', label: 'Equal', color: 'purple'},
  {type: 'custom', icon: 'calculator', label: 'Custom', color: 'warning'},
  {type: 'percentage', icon: 'pie-chart-outline', label: 'Percentage', color: 'blue'},
  {type: 'shares', icon: 'grid-outline', label: 'Shares', color: 'green'},
];
