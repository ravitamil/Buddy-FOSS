import {ActionGrid, Badge, IconTile, resolveThemeColor} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React, {useMemo} from 'react';
import {View, useTheme} from 'tamagui';

import {LoanGlassCard} from '../LoanGlassCard';
import {LoanDetailRows, type LoanDetailRow} from './LoanDetailRows';
import type {LoanDetailSectionProps} from './loanDetailSectionTypes';

const tokenColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

function useLoanOverviewColors() {
  const theme = useTheme();
  return {
    blue: tokenColor(theme.blue9?.val, '#3B82F6'),
    green: tokenColor(theme.green9?.val, '#10B981'),
    orange: tokenColor(theme.orange9?.val, '#F59E0B'),
    purple: tokenColor(theme.purple9?.val, '#8B5CF6'),
    red: tokenColor(theme.red9?.val, '#EF4444'),
    gray8: tokenColor(theme.gray8?.val, '#6B7280'),
    gray11: tokenColor(theme.gray11?.val, '#374151'),
  };
}

export function LoanSummarySection({
  loan,
  metrics,
  formatCurrency,
  formatDate,
}: Pick<LoanDetailSectionProps, 'loan' | 'metrics' | 'formatCurrency' | 'formatDate'>) {
  const theme = useTheme();
  const colors = useLoanOverviewColors();

  const resolvedColor = useMemo(() => {
    if (
      !metrics.loanColor ||
      metrics.loanColor === '#000000' ||
      metrics.loanColor.toLowerCase() === '#1f2937' ||
      metrics.loanColor.toLowerCase() === '#111827'
    ) {
      return resolveThemeColor(theme, 'primary', '#f59e0b');
    }
    return metrics.loanColor;
  }, [metrics.loanColor, theme]);

  const statusTone =
    loan.status === 'ACTIVE' ? 'success' : loan.status === 'CLOSED' ? 'neutral' : 'error';

  const rows: LoanDetailRow[] = [
    {
      icon: 'calendar',
      iconColor: colors.blue,
      label: 'Next EMI',
      value: formatDate(metrics.nextEmiDate),
    },
    {
      icon: 'checkmark-circle',
      iconColor: colors.green,
      label: 'Amount Paid',
      value: formatCurrency(metrics.paidAmount),
    },
    {
      icon: 'flag',
      iconColor: colors.orange,
      label: 'Maturity Date',
      value: formatDate(metrics.maturityDate),
    },
    {
      icon: 'list',
      iconColor: colors.purple,
      label: 'EMIs Left',
      value: `${metrics.remainingTenure} months`,
    },
  ];

  return (
    <LoanGlassCard>
      <VStack gap="$4">
        {/* Header */}
        <HStack alignItems="center" justifyContent="space-between" gap="$3">
          <HStack alignItems="center" gap="$3" flex={1}>
            <IconTile
              icon={metrics.loanIcon || 'card-outline'}
              color={resolvedColor}
              tone="soft"
              size={54}
              iconSize={26}
              shape="rounded"
            />
            <VStack flex={1} gap="$0.5">
              <Text variant="h4" color="$text" weight="bold" numberOfLines={1}>
                {loan.name}
              </Text>
              <Text variant="caption" color="$textSecondary" numberOfLines={1}>
                {loan.lenderName || 'Personal Loan'}
              </Text>
            </VStack>
          </HStack>

          <Badge label={loan.status} tone={statusTone} />
        </HStack>

        {/* Hero Remaining Balance Banner */}
        <VStack
          paddingHorizontal="$3.5"
          paddingVertical="$3"
          borderRadius={14}
          backgroundColor="$surfaceHover"
          borderWidth={1}
          borderColor="$borderColor"
          gap="$2.5">
          <VStack gap="$0.5">
            <Text
              variant="caption"
              color="$textSecondary"
              weight="semibold"
              style={{letterSpacing: 0.5, textTransform: 'uppercase'}}>
              Remaining Balance
            </Text>
            <HStack alignItems="baseline" gap="$2">
              <Text variant="h2" color="$text" weight="bold">
                {formatCurrency(metrics.amountLeft)}
              </Text>
              <Text variant="body2" color="$textSecondary">
                of {formatCurrency(metrics.totalAmount)}
              </Text>
            </HStack>
          </VStack>

          <View height={8} backgroundColor="$borderColor" borderRadius={4} overflow="hidden">
            <View
              width={`${Math.min(metrics.progressPercentage, 100)}%`}
              height="100%"
              backgroundColor={resolvedColor}
              borderRadius={4}
            />
          </View>

          <HStack alignItems="center" justifyContent="space-between">
            <Text variant="caption" color="$textSecondary" weight="medium">
              {metrics.progressPercentage.toFixed(1)}% repaid
            </Text>
            <Text variant="caption" color="$textSecondary">
              {metrics.remainingTenure} installments remaining
            </Text>
          </HStack>
        </VStack>

        {/* Key Milestone Rows */}
        <VStack gap="$1">
          <LoanDetailRows rows={rows} />
        </VStack>
      </VStack>
    </LoanGlassCard>
  );
}

export function LoanQuickActionsSection({
  loan,
  buttonText,
  hasMarkedPaid,
  onRecordPayment,
  onPrepayment,
  onDeleteLoan,
}: Pick<
  LoanDetailSectionProps,
  'loan' | 'buttonText' | 'hasMarkedPaid' | 'onRecordPayment' | 'onPrepayment' | 'onDeleteLoan'
>) {
  const colors = useLoanOverviewColors();
  const paymentBackground = loan.autoPayEnabled
    ? colors.gray8
    : hasMarkedPaid
      ? colors.blue
      : colors.green;
  const paymentForeground = loan.autoPayEnabled ? colors.gray11 : 'white';

  return (
    <LoanGlassCard>
      <VStack gap="$3.5">
        <Text variant="h5" color="$text" weight="bold">
          Quick Actions
        </Text>
        <ActionGrid
          primaryActions={[
            {
              label: loan.autoPayEnabled ? 'Auto-Tracked' : buttonText,
              icon: hasMarkedPaid ? 'checkmark-done' : 'checkmark-circle',
              backgroundColor: paymentBackground,
              foregroundColor: paymentForeground,
              onPress: onRecordPayment,
              pressStyle: {
                opacity: loan.autoPayEnabled ? 0.6 : 0.8,
                scale: loan.autoPayEnabled ? 1 : 0.98,
              },
            },
            {
              label: 'Prepayment',
              icon: 'flash-outline',
              backgroundColor: colors.purple,
              onPress: onPrepayment,
              pressStyle: {opacity: 0.8, scale: 0.98},
            },
          ]}
          secondaryAction={{
            label: 'Delete Loan',
            icon: 'trash-outline',
            backgroundColor: colors.red,
            onPress: onDeleteLoan,
            pressStyle: {opacity: 0.8, scale: 0.98},
          }}
        />
      </VStack>
    </LoanGlassCard>
  );
}
