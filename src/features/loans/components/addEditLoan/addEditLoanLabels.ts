import type {LoanFormData} from '@/types/loan.types';

export const getPayoffStrategyLabel = (strategy: LoanFormData['payoffStrategy']): string => {
  switch (strategy) {
    case 'snowball':
      return 'Snowball (smallest balance first)';
    case 'avalanche':
      return 'Avalanche (highest interest first)';
    case 'snowflake':
      return 'Snowflake (balanced approach)';
    case 'custom':
      return 'Custom (manual order)';
    default:
      return 'Select strategy';
  }
};

export const getLenderTypeLabel = (lenderType: string | undefined): string => {
  switch (lenderType) {
    case 'bank':
      return 'Bank';
    case 'nbfc':
      return 'NBFC';
    case 'private':
      return 'Private Lender';
    case 'cooperative':
      return 'Cooperative Society';
    case 'government':
      return 'Government';
    default:
      return 'Select lender type';
  }
};

export const getInterestTypeLabel = (interestType: string | undefined): string => {
  switch (interestType) {
    case 'FIXED':
      return 'Fixed Rate';
    case 'FLOATING':
      return 'Floating Rate';
    case 'HYBRID':
      return 'Hybrid Rate';
    default:
      return 'Select interest type';
  }
};
