import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import dayjs from 'dayjs';
import {XStack, YStack} from 'tamagui';

import type {SavingsGoal} from '@/types';
import {DetailRow, DetailSeparator} from './SavingsGoalDetailShared';
import type {IoniconName} from './savingsGoalDetailTypes';

export const SavingsGoalSummaryCard = ({
  amountLeft,
  daysToDeadline,
  formatCurrency,
  goal,
  goalColor: _goalColor,
  goalIcon,
  isDarkMode,
  progressPercentage,
}: {
  amountLeft: number;
  daysToDeadline: number;
  formatCurrency: (amount: number) => string;
  goal: SavingsGoal;
  goalColor: string;
  goalIcon: string;
  isDarkMode: boolean;
  progressPercentage: number;
}) => {
  const isCompleted = progressPercentage >= 100;

  return (
    <GlassSurface padding="$4" borderRadius="$4">
      <VStack gap="$4">
        {/* Header Hero */}
        <HStack alignItems="center" gap="$3">
          <YStack
            width={60}
            height={60}
            borderRadius={30}
            alignItems="center"
            justifyContent="center"
            backgroundColor="$blue4"
            borderWidth={1}
            borderColor="$blue6">
            <Ionicons
              name={(goalIcon as IoniconName) || 'flag-outline'}
              size={30}
              color="$blue10"
            />
          </YStack>

          <VStack flex={1} gap="$1">
            <Text variant="h3" color="$color" weight="bold" numberOfLines={1}>
              {goal.name}
            </Text>
            <HStack alignItems="baseline" gap="$1.5">
              <Text variant="h4" color="$iconBrand" weight="bold">
                {formatCurrency(amountLeft)}
              </Text>
              <Text variant="caption" color="$colorSubtitle">
                remaining
              </Text>
            </HStack>
          </VStack>

          <VStack alignItems="flex-end" gap="$1">
            <Text variant="h4" color="$color" weight="bold">
              {progressPercentage.toFixed(0)}%
            </Text>
            <Text variant="caption" color={isCompleted ? '$green10' : '$blue10'} weight="bold">
              {isCompleted ? 'Completed' : 'In Progress'}
            </Text>
          </VStack>
        </HStack>

        {/* Progress Bar */}
        <YStack gap="$1">
          <XStack
            height={8}
            width="100%"
            borderRadius={4}
            overflow="hidden"
            backgroundColor="$surfacePress">
            <YStack
              height="100%"
              width={`${Math.min(Math.max(progressPercentage, 0), 100)}%`}
              borderRadius={4}
              backgroundColor={isCompleted ? '$green9' : '$blue9'}
            />
          </XStack>
        </YStack>

        {/* Milestone Breakdown */}
        <VStack gap="$2.5">
          <DetailRow
            icon="calendar-outline"
            iconColor="$blue10"
            label="Target Date"
            value={dayjs(goal.deadline).format('MMM DD, YYYY')}
          />
          <DetailSeparator isDarkMode={isDarkMode} />
          <DetailRow
            icon="checkmark-circle-outline"
            iconColor="$green10"
            label="Amount Saved"
            value={formatCurrency(goal.currentAmount)}
          />
          <DetailSeparator isDarkMode={isDarkMode} />
          <DetailRow
            icon="flag-outline"
            iconColor="$primary"
            label="Target Goal"
            value={formatCurrency(goal.targetAmount)}
          />
          <DetailSeparator isDarkMode={isDarkMode} />
          <DetailRow
            icon="time-outline"
            iconColor="$purple10"
            label="Time Remaining"
            value={daysToDeadline > 0 ? `${daysToDeadline} days left` : 'Deadline reached'}
          />
        </VStack>
      </VStack>
    </GlassSurface>
  );
};
