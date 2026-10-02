import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View, XStack, YStack} from 'tamagui';

import {useSettings} from '@/context/SettingsContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {PortfolioGlassCard} from './PortfolioGlassCard';

export const SavingsGoalsAllocationCard = ({
  goalCount,
  totalSavingsGoals,
  totalGoalTargets,
  overallProgress,
  onPress,
}: {
  goalCount: number;
  totalSavingsGoals: number;
  totalGoalTargets: number;
  overallProgress: number;
  onPress: () => void;
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const {formatCurrency} = useSettings();

  return (
    <View accessibilityRole="button" onPress={onPress} pressStyle={{opacity: 0.8}}>
      <PortfolioGlassCard marginBottom={12}>
        <XStack alignItems="center" gap="$4">
          <YStack
            width={50}
            height={50}
            borderRadius={25}
            backgroundColor="#2196F3"
            alignItems="center"
            justifyContent="center"
            shadowColor="#2196F3"
            shadowOffset={{width: 0, height: 4}}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={8}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </YStack>
          <YStack flex={1} gap="$1">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="body1" color="$text" weight="semibold">
                Savings Goals
              </Text>
              <Text variant="body2" color="#2196F3" weight="bold">
                {overallProgress.toFixed(1)}% progress
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="h5" color="$text" weight="bold">
                {formatCurrency(totalSavingsGoals)}
              </Text>
              <Text variant="body2" color="$textSecondary">
                {goalCount} goal{goalCount !== 1 ? 's' : ''}
              </Text>
            </XStack>
            <Text variant="caption" color="$textSecondary" numberOfLines={1}>
              Target: {formatCurrency(totalGoalTargets || 0)}
            </Text>
          </YStack>
          <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </XStack>
      </PortfolioGlassCard>
    </View>
  );
};
