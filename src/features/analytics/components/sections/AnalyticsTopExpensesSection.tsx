import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {isEmojiCategoryIcon} from '@/features/transactions/components/transactionDetailPresentation';
import type {AnalyticsScreenModel} from '../../hooks/useAnalyticsScreen';

interface AnalyticsTopExpensesSectionProps {
  screen: AnalyticsScreenModel;
}

export const AnalyticsTopExpensesSection: React.FC<AnalyticsTopExpensesSectionProps> = ({
  screen,
}) => {
  const {isDarkMode} = useTamaguiTheme();

  if (screen.topExpenses.length === 0) {
    return null;
  }

  return (
    <GlassSurface padding="$4" borderRadius={24} style={{overflow: 'hidden'}}>
      <VStack gap="$3">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <VStack gap="$0.5">
            <HStack alignItems="center" gap="$1.5">
              <Ionicons name="receipt-outline" size={18} color="#EC4899" />
              <Text variant="h5" color="$text" weight="bold">
                Largest Purchases
              </Text>
            </HStack>
            <Text variant="caption" color="$textSecondary">
              Top individual expenses driving this period's spend
            </Text>
          </VStack>
        </HStack>

        {/* Expense Items */}
        <VStack gap="$2" marginTop="$1">
          {screen.topExpenses.map((expense) => {
            const hasEmoji = Boolean(
              expense.categoryIcon && isEmojiCategoryIcon(expense.categoryIcon),
            );
            const iconName =
              expense.categoryIcon && !hasEmoji && expense.categoryIcon in Ionicons.glyphMap
                ? (expense.categoryIcon as keyof typeof Ionicons.glyphMap)
                : 'card-outline';

            return (
              <HStack
                key={expense.id}
                alignItems="center"
                justifyContent="space-between"
                padding="$3"
                borderRadius={16}
                backgroundColor={
                  isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
                }>
                <HStack alignItems="center" gap="$3" flex={1}>
                  <VStack
                    width={36}
                    height={36}
                    borderRadius={18}
                    backgroundColor={`${expense.categoryColor}25`}
                    alignItems="center"
                    justifyContent="center">
                    {hasEmoji ? (
                      <Text fontSize={18}>{expense.categoryIcon}</Text>
                    ) : (
                      <Ionicons name={iconName} size={18} color={expense.categoryColor} />
                    )}
                  </VStack>
                  <VStack flex={1} gap="$0.5">
                    <Text variant="body2" color="$text" weight="semibold" numberOfLines={1}>
                      {expense.description}
                    </Text>
                    <HStack alignItems="center" gap="$1.5">
                      <Text variant="caption" color="$textSecondary" fontSize={11}>
                        {expense.categoryName}
                      </Text>
                      <Text variant="caption" color="$textSecondary" fontSize={10}>
                        •
                      </Text>
                      <Text variant="caption" color="$textSecondary" fontSize={11}>
                        {expense.date}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>

                <Text variant="body2" color="$text" weight="bold">
                  -{screen.formatCurrency(expense.amount)}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </VStack>
    </GlassSurface>
  );
};
