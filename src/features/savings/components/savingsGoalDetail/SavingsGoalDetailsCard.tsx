import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import dayjs from 'dayjs';
import {useTheme} from 'tamagui';

import type {SavingsGoal} from '@/types';
import {DetailRow, DetailSeparator, tokenColor} from './SavingsGoalDetailShared';

export const SavingsGoalDetailsCard = ({
  goal,
  isDarkMode,
}: {
  goal: SavingsGoal;
  isDarkMode: boolean;
}) => {
  const theme = useTheme();
  const blue = tokenColor(theme.blue9?.val, '#3B82F6');
  const gray = tokenColor(theme.gray9?.val, '#6B7280');
  const orange = tokenColor(theme.orange9?.val, '#F59E0B');
  const purple = tokenColor(theme.purple9?.val, '#8B5CF6');

  return (
    <GlassSurface padding={16}>
      <VStack gap="$4">
        <Text variant="h4" color="$text" weight="bold">
          Goal Details
        </Text>

        <VStack gap="$2">
          <DetailRow icon="flag" iconColor={blue} label="Goal Name" value={goal.name} />
          <DetailSeparator isDarkMode={isDarkMode} />
          <DetailRow
            icon="folder"
            iconColor={purple}
            label="Category"
            value={goal.category || 'Other'}
          />
          <DetailSeparator isDarkMode={isDarkMode} />
          <DetailRow
            icon="calendar-outline"
            iconColor={orange}
            label="Created On"
            value={dayjs(goal.createdAt).format('MMM DD, YYYY')}
          />

          {goal.description && (
            <>
              <DetailSeparator isDarkMode={isDarkMode} />
              <VStack gap="$2" paddingVertical="$2">
                <HStack alignItems="center" gap="$2">
                  <Ionicons name="document-text" size={16} color={gray} />
                  <Text variant="body1" color="$textSecondary" weight="medium">
                    Description
                  </Text>
                </HStack>
                <Text variant="body2" color="$text">
                  {goal.description}
                </Text>
              </VStack>
            </>
          )}
        </VStack>
      </VStack>
    </GlassSurface>
  );
};
