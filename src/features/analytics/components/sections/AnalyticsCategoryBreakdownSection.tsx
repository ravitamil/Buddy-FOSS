import {Button, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {useState} from 'react';
import {PieChart} from 'react-native-gifted-charts';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {isEmojiCategoryIcon} from '@/features/transactions/components/transactionDetailPresentation';
import type {AnalyticsScreenModel} from '../../hooks/useAnalyticsScreen';

interface AnalyticsCategoryBreakdownSectionProps {
  screen: AnalyticsScreenModel;
}

export const AnalyticsCategoryBreakdownSection: React.FC<
  AnalyticsCategoryBreakdownSectionProps
> = ({screen}) => {
  const {isDarkMode} = useTamaguiTheme();
  const [showAll, setShowAll] = useState(false);

  if (screen.categoryBreakdown.length === 0) {
    return null;
  }

  const displayedCategories = showAll
    ? screen.categoryBreakdown
    : screen.categoryBreakdown.slice(0, 4);

  return (
    <GlassSurface padding="$4" borderRadius={24} style={{overflow: 'hidden'}}>
      <VStack gap="$3">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <VStack gap="$0.5">
            <HStack alignItems="center" gap="$1.5">
              <Ionicons name="pie-chart" size={18} color="#8B5CF6" />
              <Text variant="h5" color="$text" weight="bold">
                Spending by Category
              </Text>
            </HStack>
            <Text variant="caption" color="$textSecondary">
              {screen.categoryBreakdown.length} active spending{' '}
              {screen.categoryBreakdown.length === 1 ? 'category' : 'categories'}
            </Text>
          </VStack>
        </HStack>

        {/* Donut Chart */}
        <VStack alignItems="center" paddingVertical="$2">
          <PieChart
            data={screen.pieData}
            donut
            radius={84}
            innerRadius={54}
            innerCircleColor={isDarkMode ? '#171717' : '#FFFFFF'}
            centerLabelComponent={() => (
              <VStack alignItems="center" justifyContent="center">
                <Text variant="caption" color="$textSecondary" fontSize={10} weight="medium">
                  Total Spend
                </Text>
                <Text variant="body2" color="$text" weight="bold">
                  {screen.formatCurrency(screen.totalExpenses)}
                </Text>
              </VStack>
            )}
            isAnimated
            animationDuration={800}
          />
        </VStack>

        {/* Category List */}
        <VStack gap="$2.5" marginTop="$1">
          {displayedCategories.map((cat) => {
            const hasEmoji = Boolean(cat.icon && isEmojiCategoryIcon(cat.icon));
            const iconName =
              cat.icon && !hasEmoji && cat.icon in Ionicons.glyphMap
                ? (cat.icon as keyof typeof Ionicons.glyphMap)
                : 'pricetag-outline';

            return (
              <VStack
                key={cat.id}
                padding="$3"
                borderRadius={16}
                backgroundColor={
                  isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.5)'
                }
                gap="$2">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack alignItems="center" gap="$2.5" flex={1}>
                    <VStack
                      width={32}
                      height={32}
                      borderRadius={16}
                      backgroundColor={`${cat.color}25`}
                      alignItems="center"
                      justifyContent="center">
                      {hasEmoji ? (
                        <Text fontSize={16}>{cat.icon}</Text>
                      ) : (
                        <Ionicons name={iconName} size={16} color={cat.color} />
                      )}
                    </VStack>
                    <VStack flex={1}>
                      <Text variant="body2" color="$text" weight="semibold" numberOfLines={1}>
                        {cat.name}
                      </Text>
                      <Text variant="caption" color="$textSecondary" fontSize={11}>
                        {cat.transactionCount} {cat.transactionCount === 1 ? 'expense' : 'expenses'}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack alignItems="center" gap="$2">
                    <Text variant="body2" color="$text" weight="bold">
                      {screen.formatCurrency(cat.amount)}
                    </Text>
                    <VStack
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$4"
                      backgroundColor={`${cat.color}20`}>
                      <Text
                        variant="caption"
                        weight="bold"
                        style={{color: cat.color}}
                        fontSize={11}>
                        {cat.percentage.toFixed(0)}%
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>

                {/* Progress bar track */}
                <VStack
                  height={5}
                  width="100%"
                  borderRadius={3}
                  backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
                  style={{overflow: 'hidden'}}>
                  <VStack
                    height={5}
                    width={`${Math.min(100, Math.max(2, cat.percentage))}%`}
                    borderRadius={3}
                    backgroundColor={cat.color}
                  />
                </VStack>
              </VStack>
            );
          })}

          {screen.categoryBreakdown.length > 4 && (
            <Button
              variant="ghost"
              size="small"
              onPress={() => setShowAll(!showAll)}
              marginTop="$1">
              <Text variant="caption" color="$iconBrand" weight="semibold">
                {showAll
                  ? 'Show Fewer Categories'
                  : `View All (${screen.categoryBreakdown.length})`}
              </Text>
            </Button>
          )}
        </VStack>
      </VStack>
    </GlassSurface>
  );
};
