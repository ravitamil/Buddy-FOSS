import {Button, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import dayjs from 'dayjs';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {LoanInstallmentDetail} from '../../hooks/useLoanDetailScreen';
import {
  type FormatCurrency,
  LoanDetailModalRow,
  LoanModalShell,
  useLoanModalColors,
} from './LoanDetailModalPrimitives';

interface LoanInstallmentDetailModalProps {
  installment: LoanInstallmentDetail | null;
  formatCurrency: FormatCurrency;
  visible: boolean;
  onClose: () => void;
  onRecordPayment: () => void;
}

export function LoanInstallmentDetailModal({
  installment,
  formatCurrency,
  visible,
  onClose,
  onRecordPayment,
}: LoanInstallmentDetailModalProps) {
  const colors = useLoanModalColors();
  const {isDarkMode} = useTamaguiTheme();
  if (!visible || !installment) return null;

  const statusColor =
    installment.status === 'paid'
      ? colors.green
      : installment.status === 'overdue'
        ? colors.red
        : colors.orange;

  return (
    <LoanModalShell zIndex={2000} opacity={0.8}>
      <GlassSurface padding="$6" borderRadius={20} style={{width: '90%', maxWidth: 400}}>
        <VStack gap="$4">
          <HStack justifyContent="space-between" alignItems="center">
            <Text variant="h4" color="$text" weight="bold">
              EMI #{installment.installmentNumber}
            </Text>
            <Button
              variant="ghost"
              onPress={onClose}
              width={32}
              height={32}
              borderRadius={16}
              paddingHorizontal={0}>
              <Ionicons name="close" size={20} color={isDarkMode ? '#ffffff' : '#000000'} />
            </Button>
          </HStack>
          <HStack alignItems="center" gap="$2">
            <VStack
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius={12}
              backgroundColor={statusColor}>
              <Text variant="caption" color="white" weight="bold" textTransform="uppercase">
                {installment.status}
              </Text>
            </VStack>
            {installment.isPaid && installment.paidDate && (
              <Text variant="caption" color="$textSecondary">
                Paid on {dayjs(installment.paidDate).format('MMM DD, YYYY')}
              </Text>
            )}
          </HStack>
          <VStack gap="$3">
            <LoanDetailModalRow
              icon="calendar"
              label="Due Date"
              value={dayjs(installment.dueDate).format('MMM DD, YYYY')}
            />
            <LoanDetailModalRow
              icon="cash"
              label="EMI Amount"
              value={formatCurrency(installment.amount)}
            />
            <LoanDetailModalRow
              icon="pie-chart"
              label="Principal"
              value={formatCurrency(installment.principalAmount)}
            />
            <LoanDetailModalRow
              icon="trending-up"
              label="Interest"
              value={formatCurrency(installment.interestAmount)}
            />
            <LoanDetailModalRow
              icon="wallet"
              label="Outstanding Balance"
              value={formatCurrency(installment.outstandingBalance)}
            />
          </VStack>
          <HStack gap="$3" marginTop="$2">
            <Button flex={1} variant="outline" onPress={onClose}>
              Close
            </Button>
            {!installment.isPaid && (
              <Button flex={1} backgroundColor={colors.green} onPress={onRecordPayment}>
                <Text color="white" weight="semibold">
                  Mark as Paid
                </Text>
              </Button>
            )}
          </HStack>
        </VStack>
      </GlassSurface>
    </LoanModalShell>
  );
}
