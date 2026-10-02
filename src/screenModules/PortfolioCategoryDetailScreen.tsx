import {VStack, HStack, Text, MetricCard} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React, {useState, useMemo, useCallback} from 'react';
import {RefreshControl} from 'react-native';
import Animated, {useSharedValue, useAnimatedScrollHandler} from 'react-native-reanimated';
import {useRouter} from 'expo-router';
import {YStack, styled} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {semanticHexColor} from '@ravitamil/buddy-ui/theme';
import {PieChart} from 'react-native-gifted-charts';
import {useTamaguiTheme} from '../context/TamaguiThemeProvider';
import {ScreenContainer, CustomNavigationHeader, ScreenWrapper} from '../components/ui';

import {useSettings, useInvestment} from '../context';
import {appRoutes} from '../navigation/routes';
import type {Investment} from '../types';

const portfolioColors = {
  positive: semanticHexColor('success'),
  negative: '#FF5722',
  info: semanticHexColor('info'),
  infoSoft: '#42A5F5',
  successSoft: '#66BB6A',
  dangerSoft: '#FF7043',
  teal: '#4ECDC4',
  tealDark: '#44A08D',
  chartPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
};

const PressableSurface = styled(YStack, {
  name: 'PortfolioCategoryPressableSurface',
  alignItems: 'stretch',
  padding: 0,
  borderWidth: 0,
  backgroundColor: 'transparent',
  marginBottom: 12,
  pressStyle: {
    opacity: 0.84,
    scale: 0.99,
  },
});

const HeaderActionButton = styled(YStack, {
  name: 'PortfolioCategoryHeaderActionButton',
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$teal',
  pressStyle: {
    opacity: 0.8,
    scale: 0.98,
  },
});

const TextLinkButton = styled(YStack, {
  name: 'PortfolioCategoryTextLinkButton',
  padding: 0,
  marginTop: '$4',
  pressStyle: {
    opacity: 0.75,
  },
});

const InvestmentItem = ({
  investment,
  onPress,
  formatCurrency,
}: {
  investment: Investment;
  onPress: () => void;
  formatCurrency: (amount: number) => string;
}) => {
  const currentValue = (investment.currentPrice || 0) * (investment.quantity || 0);
  const investedValue = (investment.purchasePrice || 0) * (investment.quantity || 0);
  const returns = currentValue - investedValue;
  const returnPercentage = investedValue > 0 ? (returns / investedValue) * 100 : 0;

  return (
    <PressableSurface onPress={onPress} accessibilityRole="button">
      <GlassSurface>
        <VStack gap="$3">
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1}>
              <Text variant="h6" color="$text" weight="bold" numberOfLines={1}>
                {investment.name}
              </Text>
              <Text variant="caption" color="$textSecondary">
                {investment.symbol ? `${investment.symbol} • ` : ''}
                {investment.type}
              </Text>
            </VStack>

            <VStack alignItems="flex-end">
              <Text variant="h6" color="$text" weight="bold">
                {formatCurrency(currentValue)}
              </Text>
              <Text
                variant="caption"
                color={returnPercentage >= 0 ? portfolioColors.positive : portfolioColors.negative}
                weight="bold">
                {returnPercentage >= 0 ? '+' : ''}
                {returnPercentage.toFixed(2)}%
              </Text>
            </VStack>
          </HStack>

          <HStack justifyContent="space-between">
            <VStack>
              <Text variant="caption" color="$textSecondary">
                Invested
              </Text>
              <Text variant="body2" color="$text" weight="medium">
                {formatCurrency(investedValue)}
              </Text>
            </VStack>

            <VStack>
              <Text variant="caption" color="$textSecondary">
                Returns
              </Text>
              <Text
                variant="body2"
                color={returns >= 0 ? portfolioColors.positive : portfolioColors.negative}
                weight="medium">
                {formatCurrency(returns)}
              </Text>
            </VStack>

            {investment.quantity && (
              <VStack>
                <Text variant="caption" color="$textSecondary">
                  Quantity
                </Text>
                <Text variant="body2" color="$text" weight="medium">
                  {investment.quantity}
                </Text>
              </VStack>
            )}
          </HStack>
        </VStack>
      </GlassSurface>
    </PressableSurface>
  );
};

interface PortfolioCategoryDetailScreenProps {
  categoryId: string;
}

export default function PortfolioCategoryDetailScreen({
  categoryId,
}: PortfolioCategoryDetailScreenProps) {
  const router = useRouter();
  const {formatCurrency} = useSettings();
  const {investments, investmentCategories} = useInvestment();
  const {isDarkMode} = useTamaguiTheme();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerProps = {
    scrollY,
    enableProgressiveBlur: true,
  };

  // Find the category
  const category = useMemo(
    () => investmentCategories.find((cat) => cat.id === categoryId),
    [investmentCategories, categoryId],
  );

  // Get investments for this category
  const categoryInvestments = useMemo(
    () => investments.filter((inv) => inv.categoryId === categoryId && (inv.isActive ?? true)),
    [investments, categoryId],
  );

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    const totalValue = categoryInvestments.reduce(
      (sum, inv) => sum + (inv.currentPrice || 0) * (inv.quantity || 0),
      0,
    );
    const totalInvested = categoryInvestments.reduce(
      (sum, inv) => sum + (inv.purchasePrice || 0) * (inv.quantity || 0),
      0,
    );
    const totalReturns = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalInvested,
      totalReturns,
      returnPercentage,
      count: categoryInvestments.length,
    };
  }, [categoryInvestments]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleInvestmentPress = (investment: Investment) => {
    // Navigate to investment detail screen
    router.push(appRoutes.investmentDetail(investment.id));
  };

  const handleEditCategory = () => {
    router.push(appRoutes.investmentCategoryEdit(categoryId));
  };

  // Prepare chart data for allocation within category
  const chartData = useMemo(() => {
    return categoryInvestments.map((investment, index) => {
      return {
        text: investment.name,
        value: (investment.currentPrice || 0) * (investment.quantity || 0),
        color: portfolioColors.chartPalette[index % portfolioColors.chartPalette.length],
      };
    });
  }, [categoryInvestments, isDarkMode]);

  if (!category) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
        <CustomNavigationHeader
          title="Category Not Found"
          onBackPress={() => router.back()}
          mode="static"
        />
        <VStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Text variant="h4" color="$text" weight="bold" textAlign="center">
            Category Not Found
          </Text>
          <Text variant="body2" color="$textSecondary" textAlign="center" marginTop="$2">
            The requested investment category could not be found.
          </Text>
          <TextLinkButton onPress={() => router.back()} accessibilityRole="button">
            <Text variant="body2" color={portfolioColors.teal}>
              Go Back
            </Text>
          </TextLinkButton>
        </VStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={category.name}
        subtitle={`${categoryStats.count} investment${categoryStats.count !== 1 ? 's' : ''} • ${category.riskLevel} risk`}
        onBackPress={() => router.back()}
        mode="collapsing"
        {...headerProps}
        rightElement={
          <HeaderActionButton onPress={handleEditCategory} accessibilityRole="button">
            <Ionicons name="create-outline" size={20} color="white" />
          </HeaderActionButton>
        }
      />
      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardAvoiding={false}
        scrollable={false}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{paddingTop: 118, paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDarkMode ? '#fff' : '#000'}
            />
          }>
          <VStack flex={1} padding="$4" gap="$4">
            {/* Category Overview Cards */}
            <HStack gap="$2" marginTop="$4">
              <MetricCard
                title="Total Value"
                value={formatCurrency(categoryStats.totalValue)}
                icon="trending-up"
                trend={`${categoryStats.returnPercentage >= 0 ? '+' : ''}${categoryStats.returnPercentage.toFixed(1)}%`}
                trendColor={
                  categoryStats.returnPercentage >= 0
                    ? portfolioColors.positive
                    : portfolioColors.negative
                }
                tone={categoryStats.returnPercentage >= 0 ? 'positive' : 'negative'}
                onPress={() => {}}
              />

              <MetricCard
                title="Total Returns"
                value={formatCurrency(categoryStats.totalReturns)}
                icon={categoryStats.totalReturns >= 0 ? 'trending-up' : 'trending-down'}
                trend={`${categoryStats.count} investments`}
                trendColor={
                  categoryStats.totalReturns >= 0 ? portfolioColors.info : portfolioColors.negative
                }
                tone={categoryStats.totalReturns >= 0 ? 'positive' : 'negative'}
                onPress={() => {}}
              />
            </HStack>

            {/* Allocation Chart */}
            {chartData.length > 1 && (
              <GlassSurface style={{marginTop: 16}}>
                <VStack gap="$3">
                  <Text variant="h5" color="$text" weight="bold">
                    Investment Allocation
                  </Text>

                  <PieChart
                    data={chartData}
                    radius={90}
                    backgroundColor="transparent"
                    donut
                    showText
                  />
                </VStack>
              </GlassSurface>
            )}

            {/* Investments List */}
            <VStack gap="$3" marginTop="$4">
              <Text variant="h5" color="$text" weight="bold">
                Investments
              </Text>

              {categoryInvestments.length > 0 ? (
                categoryInvestments.map((investment) => (
                  <InvestmentItem
                    key={investment.id}
                    investment={investment}
                    onPress={() => handleInvestmentPress(investment)}
                    formatCurrency={formatCurrency}
                  />
                ))
              ) : (
                <Text variant="body2" color="$textSecondary" textAlign="center" padding="$4">
                  No investments in this category yet.
                </Text>
              )}
            </VStack>
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
}
