import {
  Badge,
  Button,
  EmptyState,
  GlassSurface,
  HStack,
  IconTile,
  Text,
  VStack,
  resolveThemeColor,
} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {useCallback, useState} from 'react';
import {View, XStack, useTheme} from 'tamagui';
import {router} from 'expo-router';

import {ScreenWrapper} from '@/components/ui';
import {useSettings} from '@/context';
import {useAlert} from '@/hooks/useAlert';

import {useBudgetCycleModel} from '../hooks/useBudgetCycleModel';
import {useBudgetState} from '../hooks/useBudgetState';
import {budgetRoutes} from '../routes';
import type {Budget} from '@/types';

export function BudgetTrackerView() {
  const {budgets, activeBudget, deleteBudget, setActiveBudget} = useBudgetState();
  const cycle = useBudgetCycleModel(activeBudget);
  const {formatCurrency} = useSettings();
  const {showAlert} = useAlert();
  const theme = useTheme();
  const [isUpdatingPlanId, setIsUpdatingPlanId] = useState<string | null>(null);
  const emptyStateIconColor = resolveThemeColor(theme, 'primary', '#10b981');

  const activatePlan = useCallback(
    async (budget: Budget) => {
      try {
        setIsUpdatingPlanId(budget.id);
        await setActiveBudget(budget.id);
      } catch {
        showAlert({title: 'Could not activate plan', message: 'Please try again.'});
      } finally {
        setIsUpdatingPlanId(null);
      }
    },
    [setActiveBudget, showAlert],
  );

  const confirmDeletePlan = useCallback(
    (budget: Budget) => {
      showAlert({
        title: 'Delete budget plan?',
        message: `Delete ${budget.name}? This cannot be undone.`,
        actions: [
          {text: 'Cancel'},
          {
            text: 'Delete',
            onPress: () => {
              void deletePlan(budget);
            },
          },
        ],
      });
    },
    [showAlert],
  );

  const deletePlan = useCallback(
    async (budget: Budget) => {
      try {
        setIsUpdatingPlanId(budget.id);
        await deleteBudget(budget.id);
      } catch {
        showAlert({title: 'Could not delete plan', message: 'Please try again.'});
      } finally {
        setIsUpdatingPlanId(null);
      }
    },
    [deleteBudget, showAlert],
  );

  if (!activeBudget && budgets.length === 0) {
    return (
      <VStack flex={1} style={{marginTop: -120}}>
        <BudgetTrackerEmptyState
          iconColor={emptyStateIconColor}
          onSetup={() => router.push(budgetRoutes.create())}
        />
      </VStack>
    );
  }

  const utilization = cycle ? Math.round(cycle.utilizationPercentage) : 0;
  const utilizationTone = utilization > 100 ? 'error' : utilization > 85 ? 'warning' : 'info';
  const progressFillColor =
    utilization > 100 ? '$expense' : utilization > 85 ? '$warning' : '$income';

  return (
    <ScreenWrapper edges={[]} backgroundColor="transparent" padding>
      <VStack gap="$4" paddingBottom="$20">
        {activeBudget && cycle ? (
          <View
            accessibilityRole="button"
            accessibilityLabel={`View ${activeBudget.name} details`}
            onPress={() => router.push(budgetRoutes.details(activeBudget.id))}
            pressStyle={{opacity: 0.9}}>
            <GlassSurface padding={20} borderRadius={20}>
              <VStack gap="$3.5">
                {/* Header */}
                <HStack alignItems="center" justifyContent="space-between" gap="$3">
                  <HStack alignItems="center" gap="$3" flex={1}>
                    <IconTile
                      icon="pie-chart-outline"
                      color={resolveThemeColor(theme, 'primary', '#f59e0b')}
                      tone="soft"
                      size={44}
                      iconSize={22}
                      shape="rounded"
                    />
                    <VStack flex={1} gap="$0.5">
                      <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
                        {activeBudget.name}
                      </Text>
                      <Text variant="caption" color="$textSecondary">
                        Active •{' '}
                        {activeBudget.period.charAt(0).toUpperCase() + activeBudget.period.slice(1)}{' '}
                        plan
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack alignItems="center" gap="$2">
                    <Badge label={`${utilization}% used`} tone={utilizationTone} />
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={resolveThemeColor(theme, 'textSecondary', '#9ca3af')}
                    />
                  </HStack>
                </HStack>

                {/* Progress bar */}
                <View height={8} backgroundColor="$borderColor" borderRadius={4} overflow="hidden">
                  <View
                    width={`${Math.max(0, Math.min(cycle.utilizationPercentage, 100))}%`}
                    height="100%"
                    backgroundColor={progressFillColor}
                    borderRadius={4}
                  />
                </View>

                {/* Spent & Remaining metrics row */}
                <HStack justifyContent="space-between" gap="$3" paddingTop="$1">
                  <VStack flex={1} gap="$1">
                    <Text
                      variant="caption"
                      color="$textSecondary"
                      weight="semibold"
                      style={{letterSpacing: 0.5, textTransform: 'uppercase'}}>
                      Spent
                    </Text>
                    <Text variant="h4" color="$text" weight="bold">
                      {formatCurrency(cycle.actualSpent)}
                    </Text>
                  </VStack>

                  <VStack flex={1} alignItems="flex-end" gap="$1">
                    <Text
                      variant="caption"
                      color="$textSecondary"
                      weight="semibold"
                      style={{letterSpacing: 0.5, textTransform: 'uppercase'}}>
                      Remaining
                    </Text>
                    <Text
                      variant="h4"
                      color={cycle.remainingSpending >= 0 ? '$income' : '$expense'}
                      weight="bold">
                      {formatCurrency(cycle.remainingSpending)}
                    </Text>
                  </VStack>
                </HStack>

                {/* Daily velocity pill */}
                <XStack
                  alignItems="center"
                  gap="$2"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius={12}
                  backgroundColor="$surfaceHover"
                  borderWidth={1}
                  borderColor="$borderColor">
                  <Ionicons
                    name="sparkles"
                    size={15}
                    color={resolveThemeColor(theme, 'primary', '#f59e0b')}
                  />
                  <Text variant="caption" color="$text" flex={1}>
                    <Text variant="caption" color="$text" weight="bold">
                      {formatCurrency(cycle.dailySafeToSpend)}
                    </Text>
                    {' / day available for '}
                    <Text variant="caption" color="$text" weight="semibold">
                      {cycle.daysRemaining} days
                    </Text>
                  </Text>
                </XStack>
              </VStack>
            </GlassSurface>
          </View>
        ) : (
          <GlassSurface>
            <VStack alignItems="center" gap="$3" paddingVertical="$5">
              <Text variant="h5" color="$color" weight="semibold">
                Choose an active spending plan
              </Text>
              <Text variant="body2" color="$colorSubtitle" textAlign="center">
                Select one of your saved plans below to start tracking this cycle.
              </Text>
            </VStack>
          </GlassSurface>
        )}

        {budgets.length > 0 ? (
          <VStack gap="$2.5">
            <Text variant="h5" color="$color" weight="semibold">
              Saved plans
            </Text>
            {budgets.map((budget) => (
              <PlanRow
                key={budget.id}
                budget={budget}
                formatCurrency={formatCurrency}
                isUpdating={isUpdatingPlanId === budget.id}
                onActivate={() => void activatePlan(budget)}
                onDelete={() => confirmDeletePlan(budget)}
              />
            ))}
          </VStack>
        ) : null}
      </VStack>
    </ScreenWrapper>
  );
}

export function BudgetTrackerEmptyState({
  iconColor,
  onSetup,
}: {
  iconColor: string;
  onSetup: () => void;
}) {
  return (
    <VStack flex={1} justifyContent="center" alignItems="center" gap="$4">
      <EmptyState
        icon="pie-chart-outline"
        iconColor={iconColor}
        iconAccessibilityLabel="Set up budget"
        onIconPress={onSetup}
        title="No Budget Plans Yet"
        description="Create a spending plan to balance everyday expenses, savings, and commitments."
      />
    </VStack>
  );
}

function PlanRow({
  budget,
  formatCurrency,
  isUpdating,
  onActivate,
  onDelete,
}: {
  budget: Budget;
  formatCurrency: (amount: number) => string;
  isUpdating: boolean;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={`View ${budget.name} plan`}
      onPress={() => router.push(budgetRoutes.details(budget.id))}
      pressStyle={{opacity: 0.88}}>
      <GlassSurface padding={16} borderRadius={18}>
        <VStack gap="$3">
          <HStack alignItems="center" justifyContent="space-between" gap="$3">
            <HStack alignItems="center" gap="$3" flex={1}>
              <IconTile
                icon="document-text-outline"
                color={
                  budget.isActive
                    ? resolveThemeColor(theme, 'primary', '#f59e0b')
                    : resolveThemeColor(theme, 'textSecondary', '#9ca3af')
                }
                tone="soft"
                size={40}
                iconSize={20}
                shape="rounded"
              />
              <VStack flex={1} gap="$0.5">
                <Text variant="body1" color="$text" weight="bold" numberOfLines={1}>
                  {budget.name}
                </Text>
                <Text variant="caption" color="$textSecondary">
                  {budget.period} • {formatCurrency(budget.plannedExpenses)} flexible
                </Text>
              </VStack>
            </HStack>
            <Badge
              label={budget.isActive ? 'ACTIVE' : 'SAVED'}
              tone={budget.isActive ? 'success' : 'neutral'}
            />
          </HStack>

          <HStack gap="$2" justifyContent="flex-end" alignItems="center">
            {!budget.isActive && (
              <Button
                variant="primary"
                size="small"
                disabled={isUpdating}
                onPress={onActivate}
                leftIcon={<Ionicons name="checkmark-circle-outline" size={16} color="white" />}>
                Activate
              </Button>
            )}
            <Button
              variant="outline"
              size="small"
              onPress={() => router.push(budgetRoutes.edit(budget.id))}
              leftIcon={
                <Ionicons
                  name="pencil-outline"
                  size={14}
                  color={resolveThemeColor(theme, 'text', '#ffffff')}
                />
              }>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="small"
              disabled={isUpdating}
              onPress={onDelete}
              leftIcon={
                <Ionicons
                  name="trash-outline"
                  size={14}
                  color={resolveThemeColor(theme, 'expense', '#ef4444')}
                />
              }>
              Delete
            </Button>
          </HStack>
        </VStack>
      </GlassSurface>
    </View>
  );
}
