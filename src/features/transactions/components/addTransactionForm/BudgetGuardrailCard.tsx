import {Text, useBuddyColors} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {XStack, YStack} from 'tamagui';

import {AddTransactionCard} from './AddTransactionCard';

interface BudgetGuardrail {
  categoryName: string;
  allocated: number;
  currentSpent: number;
  spentAfterTransaction: number;
  remainingAfter: number;
  utilizationAfter: number;
  alertThreshold: number;
  status: 'safe' | 'near' | 'over';
}

interface BudgetGuardrailCardProps {
  guardrail: BudgetGuardrail | null;
  formatCurrency: (amount: number) => string;
}

const statusContent = {
  safe: {icon: 'checkmark-circle' as const, key: 'income' as const, label: 'Within budget'},
  near: {icon: 'warning' as const, key: 'warning' as const, label: 'Approaching limit'},
  over: {icon: 'alert-circle' as const, key: 'expense' as const, label: 'Over budget'},
};

export function BudgetGuardrailCard({guardrail, formatCurrency}: BudgetGuardrailCardProps) {
  const colors = useBuddyColors();
  if (!guardrail) return null;
  const status = statusContent[guardrail.status];
  const statusColor = colors[status.key];

  return (
    <AddTransactionCard>
      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between" gap="$3">
          <YStack flex={1} gap="$1">
            <Text variant="h5" color="$color" weight="semibold">
              {guardrail.categoryName} budget
            </Text>
            <Text variant="caption" color="$textSecondary">
              {formatCurrency(guardrail.currentSpent)} spent of{' '}
              {formatCurrency(guardrail.allocated)}
            </Text>
          </YStack>
          <XStack alignItems="center" gap="$1">
            <Ionicons name={status.icon} size={18} color={statusColor} />
            <Text variant="caption" color={statusColor} weight="semibold">
              {status.label}
            </Text>
          </XStack>
        </XStack>

        <XStack alignItems="center" justifyContent="space-between">
          <Text variant="body2" color="$textSecondary">
            After this transaction
          </Text>
          <Text variant="body2" color={statusColor} weight="semibold">
            {guardrail.remainingAfter >= 0
              ? `${formatCurrency(guardrail.remainingAfter)} left`
              : `${formatCurrency(Math.abs(guardrail.remainingAfter))} over`}
          </Text>
        </XStack>
      </YStack>
    </AddTransactionCard>
  );
}
