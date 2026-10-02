import React from 'react';
import {useRouter, Stack} from 'expo-router';
import Animated from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {YStack} from 'tamagui';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '../components/ui';
import {useMembership} from '../context/MembershipContext';
import {useTamaguiTheme} from '../context/TamaguiThemeProvider';
import {useProgressiveBlurHeader} from '../hooks/useProgressiveBlurHeader';
import {PlanComparisonFeatureTable} from '@/features/membership/components/PlanComparisonFeatureTable';
import {PlanComparisonFloatingCta} from '@/features/membership/components/PlanComparisonFloatingCta';
import {PlanComparisonHero} from '@/features/membership/components/PlanComparisonHero';
import {PlanComparisonPlanCards} from '@/features/membership/components/PlanComparisonPlanCards';

const PlanComparisonScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {isDarkMode} = useTamaguiTheme();
  const {isPro} = useMembership();

  const {onScroll, headerProps} = useProgressiveBlurHeader({
    headerHeight: 75,
    showBackButtonInNonBlur: true,
  });

  const handleAction = () => {
    if (isPro) {
      router.push('/customer-center');
    } else {
      router.push('/paywall');
    }
  };

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
        <CustomNavigationHeader
          title="Choose Your Plan"
          subtitle="Unlock your potential"
          showBackButton={true}
          onBackPress={() => router.back()}
          mode="collapsing"
          {...headerProps}
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
            style={{flex: 1, backgroundColor: 'transparent'}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 118,
              paddingBottom: 140,
              paddingHorizontal: 16,
            }}>
            <YStack gap="$5" paddingBottom="$10">
              <PlanComparisonHero />
              <PlanComparisonPlanCards isPro={isPro} />
              <PlanComparisonFeatureTable />
            </YStack>
          </Animated.ScrollView>
        </ScreenWrapper>

        <PlanComparisonFloatingCta
          bottomInset={insets.bottom}
          isDarkMode={isDarkMode}
          isPro={isPro}
          onPress={handleAction}
        />
      </ScreenContainer>
    </>
  );
};

export default PlanComparisonScreen;
