import {ActionGrid} from '@ravitamil/buddy-ui';
import {Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {useTheme} from 'tamagui';

import {tokenColor} from './SavingsGoalDetailShared';

export const SavingsGoalQuickActionsCard = ({
  isGoalCompleted,
  onAddToCurrent,
  onDeleteGoal,
  onShowTips,
}: {
  isGoalCompleted: boolean;
  onAddToCurrent: () => void;
  onDeleteGoal: () => void;
  onShowTips: () => void;
}) => {
  const theme = useTheme();
  const blue = tokenColor(theme.blue9?.val, '#3B82F6');
  const green = tokenColor(theme.green9?.val, '#10B981');
  const purple = tokenColor(theme.purple9?.val, '#8B5CF6');
  const red = tokenColor(theme.red9?.val, '#EF4444');

  return (
    <GlassSurface padding={16}>
      <VStack gap="$4">
        <Text variant="h4" color="$text" weight="bold">
          Quick Actions
        </Text>

        <ActionGrid
          primaryActions={[
            {
              label: isGoalCompleted ? 'Goal Achieved!' : 'Add to Savings',
              icon: isGoalCompleted ? 'checkmark-done' : 'add-circle',
              backgroundColor: isGoalCompleted ? green : blue,
              onPress: onAddToCurrent,
              pressStyle: {opacity: 0.8, scale: 0.98},
            },
            {
              label: 'Tips',
              icon: 'bulb-outline',
              backgroundColor: purple,
              onPress: onShowTips,
              pressStyle: {opacity: 0.8, scale: 0.98},
            },
          ]}
          secondaryAction={{
            label: 'Delete Goal',
            icon: 'trash-outline',
            backgroundColor: red,
            onPress: onDeleteGoal,
            pressStyle: {opacity: 0.8, scale: 0.98},
          }}
        />
      </VStack>
    </GlassSurface>
  );
};
