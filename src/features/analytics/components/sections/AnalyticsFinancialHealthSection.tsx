import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {AnalyticsScreenModel} from '../../hooks/useAnalyticsScreen';

interface AnalyticsFinancialHealthSectionProps {
  screen: AnalyticsScreenModel;
}

export const AnalyticsFinancialHealthSection: React.FC<AnalyticsFinancialHealthSectionProps> = ({
  screen,
}) => {
  const {isDarkMode} = useTamaguiTheme();
  const {score, rating, tone, savingsScore, budgetScore, trendScore, insights} =
    screen.financialHealth;

  const getToneColor = (t: typeof tone) => {
    switch (t) {
      case 'positive':
        return '#10B981';
      case 'info':
        return '#3B82F6';
      case 'warning':
        return '#F59E0B';
      case 'negative':
        return '#EF4444';
      default:
        return '#10B981';
    }
  };

  const toneColor = getToneColor(tone);

  return (
    <GlassSurface padding="$4" borderRadius={24} style={{overflow: 'hidden'}}>
      <VStack gap="$3.5">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <VStack gap="$0.5">
            <HStack alignItems="center" gap="$1.5">
              <Ionicons name="shield-checkmark" size={18} color={toneColor} />
              <Text variant="h5" color="$text" weight="bold">
                Financial Health Score
              </Text>
            </HStack>
            <Text variant="caption" color="$textSecondary">
              Algorithmic assessment of your spending habits
            </Text>
          </VStack>
        </HStack>

        {/* Score Card Hero Row */}
        <HStack
          alignItems="center"
          gap="$4"
          padding="$3.5"
          borderRadius={20}
          backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.6)'}>
          {/* Circular Score Badge */}
          <VStack
            width={72}
            height={72}
            borderRadius={36}
            borderWidth={3}
            borderColor={toneColor}
            alignItems="center"
            justifyContent="center"
            backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'}>
            <Text variant="h3" color="$text" weight="bold">
              {score}
            </Text>
            <Text variant="caption" color="$textSecondary" fontSize={10}>
              / 100
            </Text>
          </VStack>

          {/* Rating description */}
          <VStack flex={1} gap="$1">
            <HStack alignItems="center" gap="$2">
              <VStack
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                borderRadius="$4"
                backgroundColor={`${toneColor}20`}>
                <Text variant="caption" weight="bold" style={{color: toneColor}}>
                  {rating}
                </Text>
              </VStack>
            </HStack>
            <Text variant="caption" color="$textSecondary" lineHeight={16}>
              {score >= 80
                ? 'Strong cashflow balance with healthy savings allocation.'
                : score >= 60
                  ? 'Moderate financial pacing. Keep discretionary spending in check.'
                  : 'Spending pace is high. Review top categories and cut back.'}
            </Text>
          </VStack>
        </HStack>

        {/* 3 Pillar Progress Bars */}
        <VStack gap="$2.5" marginTop="$1">
          <Text
            variant="caption"
            color="$textSecondary"
            weight="semibold"
            textTransform="uppercase"
            letterSpacing={0.5}>
            Score Breakdown
          </Text>

          {/* Savings */}
          <VStack gap="$1">
            <HStack justifyContent="space-between" alignItems="center">
              <Text variant="caption" color="$text">
                Savings Discipline
              </Text>
              <Text variant="caption" color="$textSecondary" weight="medium">
                {savingsScore} / 40 pts
              </Text>
            </HStack>
            <VStack
              height={5}
              borderRadius={3}
              backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
              style={{overflow: 'hidden'}}>
              <VStack
                height={5}
                width={`${(savingsScore / 40) * 100}%`}
                borderRadius={3}
                backgroundColor="#10B981"
              />
            </VStack>
          </VStack>

          {/* Budget Adherence */}
          <VStack gap="$1">
            <HStack justifyContent="space-between" alignItems="center">
              <Text variant="caption" color="$text">
                Cash Flow & Budgeting
              </Text>
              <Text variant="caption" color="$textSecondary" weight="medium">
                {budgetScore} / 35 pts
              </Text>
            </HStack>
            <VStack
              height={5}
              borderRadius={3}
              backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
              style={{overflow: 'hidden'}}>
              <VStack
                height={5}
                width={`${(budgetScore / 35) * 100}%`}
                borderRadius={3}
                backgroundColor="#3B82F6"
              />
            </VStack>
          </VStack>

          {/* Spending Trajectory */}
          <VStack gap="$1">
            <HStack justifyContent="space-between" alignItems="center">
              <Text variant="caption" color="$text">
                Spending Discipline vs Prior Period
              </Text>
              <Text variant="caption" color="$textSecondary" weight="medium">
                {trendScore} / 25 pts
              </Text>
            </HStack>
            <VStack
              height={5}
              borderRadius={3}
              backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
              style={{overflow: 'hidden'}}>
              <VStack
                height={5}
                width={`${(trendScore / 25) * 100}%`}
                borderRadius={3}
                backgroundColor="#8B5CF6"
              />
            </VStack>
          </VStack>
        </VStack>

        {/* Dynamic Insights */}
        {insights.length > 0 && (
          <VStack gap="$2" marginTop="$2">
            <Text
              variant="caption"
              color="$textSecondary"
              weight="semibold"
              textTransform="uppercase"
              letterSpacing={0.5}>
              Key Insights
            </Text>
            {insights.map((insight, index) => (
              <HStack
                key={index}
                alignItems="flex-start"
                gap="$2.5"
                padding="$2.5"
                borderRadius={12}
                backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'}>
                <Ionicons
                  name={
                    index === 0
                      ? 'checkmark-circle'
                      : index === 1
                        ? 'information-circle'
                        : 'trending-up'
                  }
                  size={16}
                  color={toneColor}
                  style={{marginTop: 2}}
                />
                <Text variant="caption" color="$text" flex={1} lineHeight={18}>
                  {insight}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </GlassSurface>
  );
};
