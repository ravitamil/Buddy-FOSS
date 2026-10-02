import {Button, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React, {useCallback, useMemo} from 'react';
import {router} from 'expo-router';
import {View, XStack, YStack} from 'tamagui';
import Animated from 'react-native-reanimated';

import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {useSavings, useSettings} from '@/context';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const getCategoryIcon = (category?: string): IoniconName => {
  const categoryIcons: Record<string, IoniconName> = {
    'Emergency Fund': 'shield-checkmark-outline',
    Vacation: 'airplane-outline',
    Home: 'home-outline',
    Education: 'school-outline',
    Retirement: 'leaf-outline',
    Car: 'car-outline',
    Wedding: 'heart-outline',
    Health: 'fitness-outline',
    Technology: 'laptop-outline',
    Hobby: 'game-controller-outline',
    Charity: 'gift-outline',
    Other: 'flag-outline',
  };

  return categoryIcons[category || 'Other'] || 'flag-outline';
};

const scrollViewStyle = {
  flex: 1,
  backgroundColor: 'transparent',
} as const;

const scrollContentStyle = {
  flexGrow: 1,
  paddingTop: 118,
  paddingBottom: 32,
} as const;

const SavingsGoalsScreen = () => {
  const {savingsGoals} = useSavings();
  const {formatCurrency} = useSettings();
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});

  const getEnhancedSavingsGoalProgress = useCallback(
    (goalId: string) => {
      const goal = savingsGoals.find((entry) => entry.id === goalId);
      if (!goal) return {progress: 0, remaining: 0, isOnTrack: false};

      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const now = new Date();
      const targetDate = new Date(goal.deadline);
      const startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      const totalDuration = targetDate.getTime() - startDate.getTime();
      const elapsedDuration = now.getTime() - startDate.getTime();
      const expectedProgress = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
      const isOnTrack = progress >= expectedProgress * 0.9;

      return {progress, remaining, isOnTrack};
    },
    [savingsGoals],
  );

  const totals = useMemo(() => {
    const totalSaved = savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
    const totalTarget = savingsGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    return {totalSaved, totalTarget, overallProgress};
  }, [savingsGoals]);

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Savings Goals"
        subtitle={`${savingsGoals.length} active target${savingsGoals.length !== 1 ? 's' : ''}`}
        largeTitle="Savings Goals"
        mode="collapsing"
        onBackPress={() => router.back()}
        {...headerProps}
        rightElement={
          <Button
            variant="ghost"
            onPress={() => router.push('/add-savings-goal')}
            accessibilityLabel="Add savings goal"
            minWidth={44}
            height={44}
            padding={0}
            alignItems="center"
            justifyContent="center">
            <Ionicons name="add" size={24} color="$iconBrand" />
          </Button>
        }
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <Animated.ScrollView
          style={scrollViewStyle}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
          scrollEventThrottle={16}
          onScroll={onScroll}>
          <VStack flex={1} padding="$4" gap="$4">
            {/* Overall Summary Card */}
            {savingsGoals.length > 0 && (
              <GlassSurface padding="$4" borderRadius="$4">
                <VStack gap="$3">
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack gap="$1">
                      <Text variant="caption" color="$colorSubtitle" weight="medium">
                        Total Saved
                      </Text>
                      <Text variant="h3" color="$green10" weight="bold">
                        {formatCurrency(totals.totalSaved)}
                      </Text>
                    </VStack>

                    <VStack alignItems="flex-end" gap="$1">
                      <Text variant="caption" color="$colorSubtitle" weight="medium">
                        Target Total
                      </Text>
                      <Text variant="h4" color="$color" weight="bold">
                        {formatCurrency(totals.totalTarget)}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Progress Bar */}
                  <YStack gap="$1">
                    <XStack
                      height={8}
                      width="100%"
                      borderRadius={4}
                      overflow="hidden"
                      backgroundColor="$surfacePress">
                      <YStack
                        height="100%"
                        width={`${Math.min(Math.max(totals.overallProgress, 0), 100)}%`}
                        borderRadius={4}
                        backgroundColor="$green9"
                      />
                    </XStack>
                    <HStack justifyContent="space-between">
                      <Text variant="caption" color="$colorSubtitle">
                        Overall Progress
                      </Text>
                      <Text variant="caption" color="$green10" weight="bold">
                        {totals.overallProgress.toFixed(1)}%
                      </Text>
                    </HStack>
                  </YStack>
                </VStack>
              </GlassSurface>
            )}

            {/* FIRE & Early Retirement CTA if not yet configured */}
            {!savingsGoals.some((g) => g.isRetirementGoal) && (
              <GlassSurface padding="$3.5" borderRadius="$4">
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack gap="$1" flex={1} paddingRight="$2">
                    <HStack alignItems="center" gap="$1.5">
                      <Ionicons name="flame" size={18} color="#F59E0B" />
                      <Text variant="body1" color="$color" weight="bold">
                        FIRE & Early Retirement
                      </Text>
                    </HStack>
                    <Text variant="caption" color="$colorSubtitle">
                      Calculate your 25x FIRE number and track your path to freedom.
                    </Text>
                  </VStack>
                  <Button
                    size="small"
                    variant="primary"
                    onPress={() => router.push('/retirement-planning')}>
                    Plan FIRE
                  </Button>
                </HStack>
              </GlassSurface>
            )}

            {/* Goals List */}
            {savingsGoals.length > 0 ? (
              <YStack gap="$3">
                {savingsGoals.map((goal) => {
                  const enhancedProgress = getEnhancedSavingsGoalProgress(goal.id);
                  const goalIcon = getCategoryIcon(goal.category);
                  const daysToDeadline = Math.ceil(
                    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  );
                  const isGoalCompleted = enhancedProgress.progress >= 100;

                  return (
                    <View
                      key={goal.id}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${goal.name} savings goal`}
                      onPress={() => router.push(`/savings/${goal.id}`)}
                      pressStyle={{opacity: 0.85, scale: 0.99}}>
                      <GlassSurface padding="$4" borderRadius="$4">
                        <VStack gap="$3">
                          {/* Top Row: Icon, Name & Status Pill */}
                          <HStack alignItems="center" gap="$3">
                            <YStack
                              width={44}
                              height={44}
                              borderRadius={22}
                              alignItems="center"
                              justifyContent="center"
                              backgroundColor={goal.isRetirementGoal ? '$orange4' : '$blue4'}
                              borderWidth={1}
                              borderColor={goal.isRetirementGoal ? '$orange6' : '$blue6'}>
                              <Ionicons
                                name={goal.isRetirementGoal ? 'flame' : goalIcon}
                                size={22}
                                color={goal.isRetirementGoal ? '#F59E0B' : '$blue10'}
                              />
                            </YStack>

                            <VStack flex={1} gap="$0.5">
                              <Text variant="h5" color="$color" weight="bold" numberOfLines={1}>
                                {goal.name}
                              </Text>
                              <HStack alignItems="center" gap="$2">
                                <Text variant="caption" color="$colorSubtitle">
                                  {goal.category || 'General'}
                                </Text>
                                {goal.isRetirementGoal && (
                                  <XStack
                                    backgroundColor="$orange4"
                                    paddingHorizontal="$2"
                                    paddingVertical="$0.5"
                                    borderRadius="$2"
                                    alignItems="center"
                                    gap="$1">
                                    <Ionicons name="flame" size={12} color="#F59E0B" />
                                    <Text variant="caption" color="#F59E0B" weight="bold">
                                      FIRE
                                    </Text>
                                  </XStack>
                                )}
                                <Text variant="caption" color="$colorSubtitle">
                                  •
                                </Text>
                                <Text
                                  variant="caption"
                                  color={
                                    isGoalCompleted
                                      ? '$green10'
                                      : enhancedProgress.isOnTrack
                                        ? '$green10'
                                        : '$orange10'
                                  }
                                  weight="medium">
                                  {isGoalCompleted
                                    ? 'Completed'
                                    : enhancedProgress.isOnTrack
                                      ? 'On Track'
                                      : 'Behind'}
                                </Text>
                              </HStack>
                            </VStack>

                            <VStack alignItems="flex-end">
                              <Text variant="h5" color="$color" weight="bold">
                                {enhancedProgress.progress.toFixed(0)}%
                              </Text>
                              <Text variant="caption" color="$colorSubtitle">
                                {daysToDeadline > 0 ? `${daysToDeadline}d left` : 'Due'}
                              </Text>
                            </VStack>
                          </HStack>

                          {/* Progress Bar & Amounts */}
                          <VStack gap="$1.5">
                            <XStack
                              height={6}
                              width="100%"
                              borderRadius={3}
                              overflow="hidden"
                              backgroundColor="$surfacePress">
                              <YStack
                                height="100%"
                                width={`${Math.min(Math.max(enhancedProgress.progress, 0), 100)}%`}
                                borderRadius={3}
                                backgroundColor={
                                  isGoalCompleted
                                    ? '$green9'
                                    : enhancedProgress.isOnTrack
                                      ? '$blue9'
                                      : '$orange9'
                                }
                              />
                            </XStack>

                            <HStack justifyContent="space-between" alignItems="center">
                              <Text variant="body2" color="$color" weight="bold">
                                {formatCurrency(goal.currentAmount)}
                              </Text>
                              <Text variant="caption" color="$colorSubtitle">
                                of {formatCurrency(goal.targetAmount)}
                              </Text>
                            </HStack>
                          </VStack>
                        </VStack>
                      </GlassSurface>
                    </View>
                  );
                })}
              </YStack>
            ) : (
              <GlassSurface padding="$6" borderRadius="$4">
                <VStack alignItems="center" gap="$4" paddingVertical="$4">
                  <YStack
                    width={72}
                    height={72}
                    borderRadius={36}
                    backgroundColor="$blue3"
                    borderWidth={1}
                    borderColor="$blue6"
                    alignItems="center"
                    justifyContent="center">
                    <Ionicons name="flag-outline" size={36} color="$blue10" />
                  </YStack>

                  <VStack alignItems="center" gap="$1" maxWidth={280}>
                    <Text variant="h4" color="$color" weight="bold" textAlign="center">
                      No Savings Goals Yet
                    </Text>
                    <Text variant="body2" color="$colorSubtitle" textAlign="center">
                      Set your financial targets, track progress, and reach milestones faster.
                    </Text>
                  </VStack>

                  <Button
                    variant="primary"
                    onPress={() => router.push('/add-savings-goal')}
                    accessibilityLabel="Create savings goal"
                    minHeight={44}
                    paddingHorizontal="$5">
                    <XStack alignItems="center" gap="$2">
                      <Ionicons name="add" size={18} color="#ffffff" />
                      <Text color="#ffffff" weight="bold" variant="body2">
                        Create Goal
                      </Text>
                    </XStack>
                  </Button>
                </VStack>
              </GlassSurface>
            )}
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default SavingsGoalsScreen;
