import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import type {ComponentProps} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useTheme} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {LoanData} from '@/types/loan.types';
import type {LoanDetailMetricsViewModel} from '../hooks/useLoanDetailScreen';
import {LoanGlassCard} from './LoanGlassCard';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type FormatCurrency = (amount: number) => string;
type FormatDate = (date: Date) => string;

const tokenColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

function useLoanColors() {
  const theme = useTheme();
  return {
    blue: tokenColor(theme.blue9?.val, '#3B82F6'),
    green: tokenColor(theme.green9?.val, '#10B981'),
    purple: tokenColor(theme.purple9?.val, '#8B5CF6'),
    red: tokenColor(theme.red9?.val, '#EF4444'),
  };
}

function Separator() {
  const {isDarkMode} = useTamaguiTheme();
  return (
    <VStack
      height={1}
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
    <VStack flex={1} alignItems="center" gap="$2">
      <HStack alignItems="center" gap="$2">
        <Ionicons name={icon} size={20} color={color} />
        <Text variant="body2" color="$textSecondary" weight="medium">
          {label}
        </Text>
      </HStack>
      <Text variant="h4" color={color} weight="bold">
        {value}
      </Text>
      <Text variant="caption" color="$textSecondary">
        {caption}
      </Text>
    </VStack>
  );
}

function StatusRow({
  icon,
  color,
  label,
  value,
}: {
  icon: IoniconName;
  color?: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <HStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
      <HStack alignItems="center" gap="$2">
        <Ionicons name={icon} size={16} color={color} />
        <Text variant="body1" color="$textSecondary" weight="medium">
          {label}
        </Text>
      </HStack>
      {typeof value === 'string' ? (
        <Text variant="body1" color="$text" weight="bold">
          {value}
        </Text>
      ) : (
        value
      )}
    </HStack>
  );
}

export function LoanAnalyticsSection({
  metrics,
  formatCurrency,
  formatDate,
}: {
  metrics: LoanDetailMetricsViewModel;
  formatCurrency: FormatCurrency;
  formatDate: FormatDate;
}) {
  const colors = useLoanColors();
  return (
    <LoanGlassCard>
      <VStack gap="$4">
        <Text variant="h4" color="$text" weight="bold">
          Loan Analytics
        </Text>
        <HStack gap="$4">
          <MetricBlock
            icon="calendar"
            color={colors.blue}
            label="Next Due"
            value={formatDate(metrics.nextEmiDate)}
            caption={`${metrics.remainingTenure} EMIs left`}
          />
          <VStack width={1} height={60} backgroundColor="$borderColor" />
          <MetricBlock
            icon="trending-up"
            color={colors.purple}
            label="Progress"
            value={`${metrics.progressPercentage.toFixed(1)}%`}
            caption={`${metrics.completedTenure} paid`}
          />
        </HStack>
        <VStack gap="$3" marginTop="$2">
          <Text variant="body2" color="$textSecondary" weight="medium">
            Payment Timeline
          </Text>
          <StatusRow
            icon="checkmark-circle"
            color={colors.green}
            label="Total Paid"
            value={formatCurrency(metrics.paidAmount)}
          />
          <Separator />
          <StatusRow
            icon="wallet"
            color={colors.blue}
            label="Remaining Amount"
            value={formatCurrency(metrics.amountLeft)}
          />
        </VStack>
      </VStack>
    </LoanGlassCard>
  );
}

export function LoanAutomationSection({loan}: {loan: LoanData}) {
  const colors = useLoanColors();
  return (
    <LoanGlassCard>
      <VStack gap="$4">
        <Text variant="h4" color="$text" weight="bold">
          Reminders & Automation
        </Text>
        <VStack gap="$3">
          <StatusRow
            icon="notifications"
            color={colors.blue}
            label="EMI Reminders"
            value={
              <Text
                variant="body1"
                color={loan.reminderEnabled ? colors.green : colors.red}
                weight="bold">
                {loan.reminderEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            }
          />
          {loan.reminderEnabled && (
            <StatusRow
              icon="calendar"
              color={colors.blue}
              label="Reminder Days"
              value={`${loan.reminderDaysBefore || 3} days before`}
            />
          )}
          <Separator />
          <StatusRow
            icon="card"
            color={colors.purple}
            label="Auto-Track"
            value={
              <Text
                variant="body1"
                color={loan.autoPayEnabled ? colors.green : colors.red}
                weight="bold">
                {loan.autoPayEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            }
          />
        </VStack>
      </VStack>
    </LoanGlassCard>
  );
}
