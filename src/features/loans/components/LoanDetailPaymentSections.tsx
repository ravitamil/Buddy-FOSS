import {Button, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import type {ComponentProps} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useTheme} from 'tamagui';

import LoanHeatMap from '@/features/loans/components/LoanHeatMap';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {LoanData, PaymentRecord} from '@/types/loan.types';
import type {LoanDetailMetricsViewModel} from '../hooks/useLoanDetailScreen';
import {LoanGlassCard} from './LoanGlassCard';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type FormatCurrency = (amount: number) => string;

const tokenColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

function useLoanColors() {
  const theme = useTheme();
  return {
    blue: tokenColor(theme.blue9?.val, '#3B82F6'),
    green: tokenColor(theme.green9?.val, '#10B981'),
    orange: tokenColor(theme.orange9?.val, '#F59E0B'),
    yellow: tokenColor(theme.yellow9?.val, '#EAB308'),
    red: tokenColor(theme.red9?.val, '#EF4444'),
  };
}

function Separator({inset = false}: {inset?: boolean}) {
  const {isDarkMode} = useTamaguiTheme();
  return (
    <VStack
      height={1}
      marginLeft={inset ? 44 : 0}
      marginVertical={inset ? 4 : 0}
      backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
    />
  );
}

function MetricBlock({
  icon,
  color,
  label,
  value,
  caption,
}: {
  icon: IoniconName;
  color?: string;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <VStack flex={1} gap="$2">
      <HStack alignItems="center" gap="$2">
        <Ionicons name={icon} size={16} color={color} />
        <Text variant="body2" color="$textSecondary" weight="medium">
          {label}
        </Text>
      </HStack>
      <Text variant="h4" color="$text" fontWeight="800" fontFamily="$body">
        {value}
      </Text>
      <Text variant="caption" color="$textSecondary">
        {caption}
      </Text>
    </VStack>
  );
}

export function LoanPaymentProgressSection({
  loan,
  metrics,
  formatCurrency,
  onInstallmentPress,
}: {
  loan: LoanData;
  metrics: LoanDetailMetricsViewModel;
  formatCurrency: FormatCurrency;
  onInstallmentPress: (installmentNumber: number) => void;
}) {
  const colors = useLoanColors();
  const preExistingCount = loan.paymentHistory.filter(
    (payment) => payment.status === 'PAID' && payment.installmentNumber == null,
  ).length;

  return (
    <LoanGlassCard>
      <VStack gap="$4">
        <HStack justifyContent="space-between" alignItems="center">
          <Text variant="h4" color="$text" weight="bold">
            Payment Progress
          </Text>
          <HStack alignItems="center" gap="$2">
            <VStack
              width={12}
              height={12}
              borderRadius={6}
              backgroundColor={metrics.progressPercentage > 50 ? colors.green : colors.orange}
            />
            <Text variant="body2" color="$textSecondary">
              {metrics.progressPercentage.toFixed(1)}% complete
            </Text>
          </HStack>
        </HStack>

        {loan.paymentHistory.length > 0 && (
          <VStack gap="$2" marginBottom="$2">
            <HStack alignItems="center" gap="$2">
              <Ionicons name="information-circle" size={16} color={colors.blue} />
              <Text variant="body2" color="$textSecondary" weight="medium">
                Pre-Existing Payments
              </Text>
            </HStack>
            <Text variant="body1" color="$text" fontWeight="700" fontFamily="$body">
              {formatCurrency(preExistingCount * loan.emiAmount)}
            </Text>
            <Separator />
          </VStack>
        )}

        <LoanHeatMap
          totalInstallments={loan.tenure}
          paymentHistory={loan.paymentHistory}
          startDate={new Date(loan.startDate)}
          paymentFrequency={loan.paymentFrequency || 'MONTHLY'}
          onInstallmentPress={onInstallmentPress}
        />

        <HStack gap="$4" marginTop="$2">
          <MetricBlock
            icon="checkmark-circle"
            color={colors.green}
            label="Total Paid"
            value={formatCurrency(metrics.paidAmount)}
            caption={`${metrics.completedTenure} EMIs completed`}
          />
          <MetricBlock
            icon="wallet"
            color={colors.orange}
            label="Remaining"
            value={formatCurrency(metrics.amountLeft)}
            caption={`${metrics.remainingTenure} EMIs left`}
          />
        </HStack>
      </VStack>
    </LoanGlassCard>
  );
}

export function LoanPaymentHistorySection({
  loan,
  showPaymentHistory,
  formatCurrency,
  onTogglePaymentHistory,
}: {
  loan: LoanData;
  showPaymentHistory: boolean;
  formatCurrency: FormatCurrency;
  onTogglePaymentHistory: (show: boolean) => void;
}) {
  const colors = useLoanColors();
  if (loan.paymentHistory.length === 0) return null;

  const visiblePayments = loan.paymentHistory.slice(
    0,
    showPaymentHistory ? loan.paymentHistory.length : 5,
  );

  return (
    <LoanGlassCard>
      <VStack gap="$3">
        <HStack justifyContent="space-between" alignItems="center">
          <Text variant="h4" color="$text" weight="bold">
            Payment History
          </Text>
          <Button
            variant="ghost"
            onPress={() => onTogglePaymentHistory(!showPaymentHistory)}
            paddingHorizontal="$2">
            <HStack alignItems="center" gap="$1">
              <Text variant="body2" color={colors.blue} weight="semibold">
                {showPaymentHistory ? 'Hide' : 'Show All'}
              </Text>
              <Ionicons
                name={showPaymentHistory ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.blue}
              />
            </HStack>
          </Button>
        </HStack>

        <VStack gap="$1">
          {visiblePayments.map((payment, index) => (
            <PaymentHistoryRow
              key={payment.id || `${payment.date}-${index}`}
              payment={payment}
              index={index}
              isLast={index === visiblePayments.length - 1}
              formatCurrency={formatCurrency}
            />
          ))}
          {loan.paymentHistory.length > 5 && !showPaymentHistory && (
            <Text variant="caption" color="$textSecondary" textAlign="center" paddingTop="$2">
              Showing 5 of {loan.paymentHistory.length} payments
            </Text>
          )}
        </VStack>
      </VStack>
    </LoanGlassCard>
  );
}

function PaymentHistoryRow({
  payment,
  index,
  isLast,
  formatCurrency,
}: {
  payment: PaymentRecord;
  index: number;
  isLast: boolean;
  formatCurrency: FormatCurrency;
}) {
  const colors = useLoanColors();
  const statusColor =
    payment.status === 'PAID'
      ? colors.green
      : payment.status === 'PENDING'
        ? colors.yellow
        : colors.red;
  const statusIcon: IoniconName =
    payment.status === 'PAID' ? 'checkmark' : payment.status === 'PENDING' ? 'time' : 'close';

  return (
    <VStack>
      <HStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
        <HStack alignItems="center" gap="$2.5">
          <VStack
            width={32}
            height={32}
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
            backgroundColor={`${statusColor}20`}>
            <Ionicons name={statusIcon} size={16} color={statusColor} />
          </VStack>
          <VStack gap="$0.5">
            <Text variant="body2" color="$text" weight="semibold">
              Payment #{index + 1}
            </Text>
            <Text variant="caption" color="$textSecondary">
              {new Date(payment.date).toLocaleDateString()}
            </Text>
          </VStack>
        </HStack>
        <VStack alignItems="flex-end" gap="$0.5">
          <Text variant="body2" color="$text" weight="semibold">
            {formatCurrency(payment.amount)}
          </Text>
          <Text variant="caption" color={statusColor} textTransform="capitalize" weight="medium">
            {payment.status.toLowerCase()}
          </Text>
        </VStack>
      </HStack>
      {!isLast && <Separator inset />}
    </VStack>
  );
}
