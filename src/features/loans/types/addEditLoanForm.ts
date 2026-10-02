import type {ComponentProps} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import type {LoanFormData, LoanType} from '@/types/loan.types';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];
export type LoanDateField = 'sanctionDate' | 'disbursementDate' | 'firstEmiDate';
export type LoanFormErrors = Partial<Record<keyof LoanFormData, string>>;
export type LoanPayoffStrategy = NonNullable<LoanFormData['payoffStrategy']>;

export interface LoanFormProps {
  initialData?: Partial<LoanFormData>;
  onSubmit: (data: LoanFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

export interface LoanTypeConfig {
  displayName: string;
  maxTenure: number;
  color: string;
  icon: IoniconName;
}

export interface SelectOption<T extends string> {
  key: T;
  label: string;
  description?: string;
}

export const LOAN_TYPE_CONFIG: Record<LoanType, LoanTypeConfig> = {
  HOME: {
    displayName: 'Home Loan',
    maxTenure: 360,
    color: '#3B82F6',
    icon: 'home-outline',
  },
  PERSONAL: {
    displayName: 'Personal Loan',
    maxTenure: 84,
    color: '#8B5CF6',
    icon: 'person-outline',
  },
  AUTO: {
    displayName: 'Car Loan',
    maxTenure: 84,
    color: '#10B981',
    icon: 'car-outline',
  },
  EDUCATION: {
    displayName: 'Education Loan',
    maxTenure: 180,
    color: '#F59E0B',
    icon: 'school-outline',
  },
  BUSINESS: {
    displayName: 'Business Loan',
    maxTenure: 120,
    color: '#EF4444',
    icon: 'briefcase-outline',
  },
  CREDIT_CARD: {
    displayName: 'Credit Card',
    maxTenure: 60,
    color: '#6366F1',
    icon: 'card-outline',
  },
  OTHER: {
    displayName: 'Other',
    maxTenure: 120,
    color: '#6B7280',
    icon: 'ellipsis-horizontal',
  },
};

export const REMINDER_DAYS_OPTIONS = [1, 2, 3, 5, 7, 10, 15] as const;

export const PAYOFF_STRATEGY_OPTIONS: Array<SelectOption<LoanPayoffStrategy>> = [
  {
    key: 'snowball',
    label: 'Snowball',
    description: 'Pay smallest balances first',
  },
  {
    key: 'avalanche',
    label: 'Avalanche',
    description: 'Pay highest interest first',
  },
  {
    key: 'snowflake',
    label: 'Snowflake',
    description: 'Balanced approach across debts',
  },
  {
    key: 'custom',
    label: 'Custom',
    description: 'Manual priority order',
  },
];

export const LENDER_TYPE_OPTIONS: Array<SelectOption<string>> = [
  {
    key: 'bank',
    label: 'Bank',
    description: 'Commercial banks and public sector banks',
  },
  {key: 'nbfc', label: 'NBFC', description: 'Non-Banking Financial Companies'},
  {
    key: 'private',
    label: 'Private Lender',
    description: 'Private individuals or companies',
  },
  {
    key: 'cooperative',
    label: 'Cooperative Society',
    description: 'Credit unions and cooperative banks',
  },
  {
    key: 'government',
    label: 'Government',
    description: 'Government schemes and institutions',
  },
];

export const INTEREST_TYPE_OPTIONS: Array<SelectOption<string>> = [
  {
    key: 'FIXED',
    label: 'Fixed Rate',
    description: 'Interest rate remains constant throughout the loan tenure',
  },
  {
    key: 'FLOATING',
    label: 'Floating Rate',
    description: 'Interest rate varies based on market conditions',
  },
  {
    key: 'HYBRID',
    label: 'Hybrid Rate',
    description: 'Fixed for initial period, then floating',
  },
];

export const formatLoanDateForDisplay = (dateString: string | undefined): string => {
  if (!dateString) {
    return '';
  }

  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year = 0, month = 1, day = 1] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
    }

    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  } catch {
    return dateString;
  }
};
