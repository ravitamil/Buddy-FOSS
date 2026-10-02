import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {RefreshControl} from 'react-native';
import Animated, {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import {useRouter} from 'expo-router';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '../components/ui';
import {useSettings} from '../context';
import {useTamaguiTheme} from '../context/TamaguiThemeProvider';
import {useAlert} from '../hooks/useAlert';
import {
  InvestmentResearchCategoryFilter,
  InvestmentResearchFilters,
  InvestmentResearchMarketIndices,
  InvestmentResearchMarketSelector,
  InvestmentResearchSearchBar,
  InvestmentResultsSection,
  MarketNewsSection,
  useInvestmentResearch,
  type StockData,
} from '../features/investments';

const InvestmentResearchScreen = () => {
  const router = useRouter();
  const {showAlert} = useAlert();
  const {isDarkMode} = useTamaguiTheme();
  const {formatCurrency} = useSettings();
  const research = useInvestmentResearch();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleAddToPortfolio = (investment: StockData) => {
    showAlert({
      title: 'Add to Portfolio',
      message: `Add ${investment.name} to your portfolio?`,
      actions: [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Add',
          onPress: () => {
            router.push({
              pathname: '/add-investment',
              params: {
                symbol: investment.symbol,
                type: investment.type,
              },
            });
          },
        },
      ],
    });
  };

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Market Research"
        subtitle="Explore global investment data"
        onBackPress={() => router.back()}
        mode="collapsing"
        scrollY={scrollY}
        enableProgressiveBlur
      />
      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardAvoiding={false}
        scrollable={false}>
        <Animated.ScrollView
          style={{flex: 1, backgroundColor: 'transparent'}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={research.refreshing}
              onRefresh={() => {
                void research.handleRefresh();
              }}
              tintColor={isDarkMode ? '#fff' : '#000'}
            />
          }
          onScroll={onScroll}
          contentContainerStyle={{paddingTop: 118, paddingBottom: 100}}
          scrollEventThrottle={16}>
          <VStack flex={1} padding="$4" gap="$4" paddingBottom="$8">
            <InvestmentResearchSearchBar research={research} />
            <InvestmentResearchMarketSelector research={research} />
            <InvestmentResearchMarketIndices research={research} />
            <InvestmentResearchFilters research={research} />
            <InvestmentResearchCategoryFilter research={research} />
            <InvestmentResultsSection
              research={research}
              formatCurrency={formatCurrency}
              onAddToPortfolio={handleAddToPortfolio}
            />
            <MarketNewsSection research={research} />
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default InvestmentResearchScreen;
