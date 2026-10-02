import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useTheme} from 'tamagui';

import type {LoanData} from '@/types/loan.types';
import type {LoanDetailMetricsViewModel} from '../hooks/useLoanDetailScreen';
import {LoanGlassCard} from './LoanGlassCard';
import {LoanDetailRows, type LoanDetailRow} from './loanDetail/LoanDetailRows';

type FormatCurrency = (amount: number) => string;
type FormatDate = (date: Date) => string;

const loanTypeLabels: Record<LoanData['loanType'], string> = {
  PERSONAL: 'Personal',
  HOME: 'Home',
  AUTO: 'Car',
  EDUCATION: 'Education',
  BUSINESS: 'Business',
  CREDIT_CARD: 'Credit Card',
  OTHER: 'Other',
};

const tokenColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

function useLoanColors() {
  const theme = useTheme();
  return {
    blue: tokenColor(theme.blue9?.val, '#3B82F6'),
    green: tokenColor(theme.green9?.val, '#10B981'),
    orange: tokenColor(theme.orange9?.val, '#F59E0B'),
    purple: tokenColor(theme.purple9?.val, '#8B5CF6'),
    red: tokenColor(theme.red9?.val, '#EF4444'),
  };
}

export function LoanDetailsSection({
  loan,
  metrics,
  formatCurrency,
  formatDate,
}: {
  loan: LoanData;
  metrics: LoanDetailMetricsViewModel;
  formatCurrency: FormatCurrency;
  formatDate: FormatDate;
}) {
  const colors = useLoanColors();
  return (
    <LoanGlassCard>
      <VStack gap="$4">
        <Text variant="h4" color="$text" weight="bold">
          Loan Details
        </Text>
        <VStack gap="$2">
          <LoanDetailRows
            rows={[
              {
                icon: 'document-text',
                iconColor: colors.blue,
                label: 'Loan Type',
                value: loanTypeLabels[loan.loanType],
              },
              {
                icon: 'trending-up',
                iconColor: colors.orange,
                label: 'Interest Rate',
                value: `${loan.interestRate}% p.a.`,
              },
              {
                icon: 'time',
                iconColor: colors.green,
                label: 'Tenure',
                value: `${loan.tenure} months`,
              },
              {
                icon: 'card',
                iconColor: colors.purple,
                label: 'EMI Amount',
                value: formatCurrency(loan.emiAmount || 0),
              },
              {
                icon: 'play',
                iconColor: colors.blue,
                label: 'Start Date',
                value: formatDate(new Date(loan.startDate)),
              },
              {
                icon: 'calendar',
                iconColor: colors.orange,
                label: 'Maturity Date',
                value: formatDate(metrics.maturityDate),
              },
              {
                icon: 'list',
                iconColor: colors.green,
                label: 'Remaining Installments',
                value: `${metrics.remainingTenure} of ${loan.tenure}`,
              },
              loan.borrowerName
                ? {
                    icon: 'person',
                    iconColor: colors.blue,
                    label: 'Borrower Name',
                    value: loan.borrowerName,
                  }
                : null,
              loan.loanAccountNumber
                ? {
                    icon: 'barcode',
                    iconColor: colors.purple,
                    label: 'Loan Account Number',
                    value: loan.loanAccountNumber,
                  }
                : null,
              loan.interestType
                ? {
                    icon: 'calculator',
                    iconColor: colors.orange,
                    label: 'Interest Type',
                    value: loan.interestType === 'FIXED' ? 'Fixed' : 'Reducing Balance',
                  }
                : null,
              loan.lenderType
                ? {
                    icon: 'business',
                    iconColor: colors.green,
                    label: 'Lender Type',
                    value: loan.lenderType === 'BANK' ? 'Bank' : 'NBFC',
                  }
                : null,
              loan.sanctionDate
                ? {
                    icon: 'document',
                    iconColor: colors.blue,
                    label: 'Sanction Date',
                    value: formatDate(new Date(loan.sanctionDate)),
                  }
                : null,
              loan.disbursementDate
                ? {
                    icon: 'cash',
                    iconColor: colors.green,
                    label: 'Disbursement Date',
                    value: formatDate(new Date(loan.disbursementDate)),
                  }
                : null,
              loan.firstEmiDate
                ? {
                    icon: 'calendar-number',
                    iconColor: colors.orange,
                    label: 'First EMI Date',
                    value: formatDate(new Date(loan.firstEmiDate)),
                  }
                : null,
            ]}
          />
        </VStack>
      </VStack>
    </LoanGlassCard>
  );
}

export function LoanChargesSection({
  loan,
  formatCurrency,
}: {
  loan: LoanData;
  formatCurrency: FormatCurrency;
}) {
  const colors = useLoanColors();
  const rows = [
    loan.processingFee && loan.processingFee > 0
      ? {
          icon: 'card' as const,
          iconColor: colors.red,
          label: 'Processing Fee',
          value: formatCurrency(loan.processingFee),
        }
      : null,
    loan.prepaymentChargesPercentage && loan.prepaymentChargesPercentage > 0
      ? {
          icon: 'flash' as const,
          iconColor: colors.red,
          label: 'Prepayment Charges',
          value: `${loan.prepaymentChargesPercentage}%`,
        }
      : null,
    loan.lateFeePercentage && loan.lateFeePercentage > 0
      ? {
          icon: 'alert-circle' as const,
          iconColor: colors.red,
          label: 'Late Fee',
          value: `${loan.lateFeePercentage}%`,
        }
      : null,
    loan.otherCharges && loan.otherCharges > 0
      ? {
          icon: 'list' as const,
          iconColor: colors.red,
          label: 'Other Charges',
          value: formatCurrency(loan.otherCharges),
        }
      : null,
  ] satisfies Array<LoanDetailRow | null>;

  if (!rows.some(Boolean)) return null;

  return (
    <LoanGlassCard>
      <VStack gap="$4">
        <HStack alignItems="center" gap="$2">
          <Ionicons name="receipt" size={20} color={colors.red} />
          <Text variant="h4" color="$text" weight="bold">
            Additional Charges
          </Text>
        </HStack>
        <VStack gap="$3">
          <LoanDetailRows rows={rows} />
        </VStack>
      </VStack>
    </LoanGlassCard>
  );
}
