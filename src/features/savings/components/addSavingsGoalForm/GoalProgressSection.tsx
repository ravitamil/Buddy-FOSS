import {Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';

import {XStack, YStack} from 'tamagui';

import {FieldLabel, SectionHeader} from './SavingsGoalFormPrimitives';
import type {AddSavingsGoalFormSectionsProps} from './types';

interface GoalProgressSectionProps extends Pick<
  AddSavingsGoalFormSectionsProps,
  'currentCategory' | 'formData'
> {
  isDarkMode: boolean;
}

export const GoalProgressSection = ({
  currentCategory,
  formData,
  isDarkMode,
}: GoalProgressSectionProps) => {
  const targetAmount = parseFloat(formData.targetAmount);
  const currentAmount = parseFloat(formData.currentAmount || '0');
  const progressPercentage = Math.min(100, (currentAmount / targetAmount) * 100);

  return (
    <GlassSurface>
      <YStack gap="$3">
        <SectionHeader
          icon="stats-chart"
          color="#8B5CF6"
          title="Goal Progress"
          description="Visual representation of your goal"
        />
        <YStack gap="$3" marginTop="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <FieldLabel>Progress</FieldLabel>
            <Text variant="body1" color="$color" fontWeight="600">
              {currentAmount > 0 ? `${((currentAmount / targetAmount) * 100).toFixed(1)}%` : '0%'}
            </Text>
          </XStack>
          <YStack
            height={12}
            borderRadius={6}
            backgroundColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            overflow="hidden">
            <YStack
              height="100%"
              width={`${progressPercentage}%`}
              backgroundColor={currentCategory.color}
              borderRadius={6}
            />
          </YStack>
          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="caption" color="$color11">
              {currentAmount > 0 ? currentAmount.toFixed(2) : '0.00'}
            </Text>
            <Text variant="caption" color="$color11">
              {targetAmount.toFixed(2)}
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </GlassSurface>
  );
};
