import {Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import dayjs from 'dayjs';
import {XStack, YStack} from 'tamagui';

import type {SavingsGoal} from '@/types';

export const RetirementGoalSummaryCard = ({
  formatCurrency,
  goal,
}: {
  formatCurrency: (amount: number) => string;
  goal: SavingsGoal;
}) => (
  <GlassSurface>
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <Text variant="h5" color="$color" weight="bold">
          {goal.name}
        </Text>
        <Text variant="body2" color="$textSecondary">
          {goal.category}
        </Text>
      </XStack>
      <XStack justifyContent="space-between" alignItems="center">
        <Text variant="body1" color="$color">
          {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
        </Text>
        <Text variant="body2" color="$textSecondary">
          {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%
        </Text>
      </XStack>
      <XStack justifyContent="space-between" alignItems="center">
        <Text variant="body2" color="$textSecondary">
          Target Date: {dayjs(goal.deadline).format('MMM D, YYYY')}
        </Text>
        <Text variant="body2" color="$textSecondary">
          {dayjs(goal.deadline).diff(dayjs(), 'year')} years
        </Text>
      </XStack>
    </YStack>
  </GlassSurface>
);
