import {Button, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {View, XStack, YStack} from 'tamagui';

import {FormField} from '@ravitamil/buddy-ui/FormField';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {UseBudgetSetupScreenResult} from '../hooks/useBudgetSetupScreen';
import {AddEditBudgetCard} from './AddEditBudgetCard';
import {PeriodSelector} from './BudgetSetupNavigation';

interface BudgetSetupBasicSectionProps {
  screen: UseBudgetSetupScreenResult;
}

const SPLIT_PRESETS = [
  'Emergency Buffer',
  'Personal Allowance',
  'Giving & Charity',
  'Vacation Fund',
] as const;

export function PlanInformationCard({screen}: BudgetSetupBasicSectionProps) {
  return (
    <AddEditBudgetCard
      title="Plan Information"
      subtitle="Choose a name, cycle rhythm, and planned income."
      icon="calendar"
      accentColor="#3B82F6">
      <VStack gap="$4">
        <FormField
          accessibilityLabel="Budget plan name"
          label="Plan Name *"
          placeholder="e.g., Household Monthly"
          value={screen.planName}
          onChangeText={screen.setPlanName}
          autoCapitalize="words"
          maxLength={40}
          testID="budget-plan-name"
        />
        <VStack gap="$2">
          <Text variant="caption" color="$textSecondary" weight="medium">
            Budget Cycle Rhythm
          </Text>
          <PeriodSelector
            selectedPeriod={screen.selectedPeriod}
            onPeriodChange={screen.setSelectedPeriod}
            isDarkMode={screen.isDarkMode}
          />
        </VStack>
        <FormField
          accessibilityLabel="Planned Income"
          label="Planned Income *"
          placeholder="0.00"
          value={screen.fields.monthlyIncome}
          onChangeText={screen.handleMonthlyIncomeChange}
          keyboardType="decimal-pad"
          editable={!screen.trackIncomeSources}
          helpText={
            screen.trackIncomeSources
              ? 'This value is calculated automatically from the itemized income breakdown.'
              : undefined
          }
          testID="monthly-income"
          leftIcon={
            <Text color="$textSecondary" weight="bold" fontSize="$5" paddingRight="$2">
              {screen.currencySymbol}
            </Text>
          }
        />
      </VStack>
    </AddEditBudgetCard>
  );
}

export function AllocationsCard({screen}: BudgetSetupBasicSectionProps) {
  const hasOverspent = screen.totals.remainingAmount < 0;

  return (
    <AddEditBudgetCard
      title="Allocations & Spending"
      subtitle="Set your flexible spending limit and planned savings."
      icon="pie-chart"
      accentColor="#10B981">
      <VStack gap="$4">
        <FormField
          accessibilityLabel="Flexible spending limit"
          label="Flexible Spending Limit"
          placeholder="0.00"
          value={screen.fields.plannedExpenses}
          onChangeText={screen.handlePlannedExpensesChange}
          keyboardType="decimal-pad"
          helpText="Everyday spending after bills. Fixed commitments are calculated separately."
          testID="planned-expenses"
          leftIcon={
            <Text color="$textSecondary" weight="bold" fontSize="$5" paddingRight="$2">
              {screen.currencySymbol}
            </Text>
          }
        />
        <FormField
          accessibilityLabel="Planned savings"
          label="Planned Savings Target"
          placeholder="0.00"
          value={screen.fields.plannedSavings}
          onChangeText={screen.handlePlannedSavingsChange}
          keyboardType="decimal-pad"
          helpText="Set aside savings before the rest becomes available to spend."
          testID="planned-savings"
          leftIcon={
            <Text color="$textSecondary" weight="bold" fontSize="$5" paddingRight="$2">
              {screen.currencySymbol}
            </Text>
          }
        />
        <HStack
          justifyContent="space-between"
          alignItems="center"
          paddingTop="$2"
          borderTopWidth={1}
          borderColor="$borderColor">
          <VStack flex={1} gap="$0.5">
            <Text variant="caption" color="$textSecondary" weight="medium">
              {hasOverspent ? 'Adjustment Needed' : 'Still Available to Allocate'}
            </Text>
            <Text variant="caption" color="$textSecondary" opacity={0.7}>
              {hasOverspent
                ? 'Allocations exceed planned income.'
                : 'Unallocated funds available for spending or goals.'}
            </Text>
          </VStack>
          <Text variant="h5" color={hasOverspent ? '$red10' : '$green10'} weight="bold">
            {screen.formatCurrency(screen.totals.remainingAmount)}
          </Text>
        </HStack>
      </VStack>
    </AddEditBudgetCard>
  );
}

export function SavingsGoalAllocationsCard({screen}: BudgetSetupBasicSectionProps) {
  if (screen.savingsGoals.length === 0) return null;

  return (
    <AddEditBudgetCard
      title="Savings Goals"
      subtitle="Divide planned savings across your active goals."
      icon="flag"
      accentColor="#EC4899">
      <VStack gap="$3">
        {screen.savingsGoals.map((goal) => {
          const allocation = screen.savingsGoalAllocations.find(
            (candidate) => candidate.goalId === goal.id,
          );
          return (
            <HStack key={goal.id} alignItems="center" justifyContent="space-between" gap="$3">
              <VStack flex={1} gap="$1">
                <Text variant="body2" color="$text" weight="semibold">
                  {goal.name}
                </Text>
                <Text variant="caption" color="$textSecondary">
                  {screen.formatCurrency(goal.currentAmount)} of{' '}
                  {screen.formatCurrency(goal.targetAmount)}
                </Text>
              </VStack>
              <VStack width={120}>
                <FormField
                  value={allocation ? String(allocation.allocatedAmount) : ''}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  textAlign="right"
                  accessibilityLabel={`Planned savings for ${goal.name}`}
                  onChangeText={(value) => screen.updateSavingsGoalAllocation(goal.id, value)}
                  leftIcon={
                    <Text color="$textSecondary" weight="medium" fontSize="$3" paddingRight="$1">
                      {screen.currencySymbol}
                    </Text>
                  }
                />
              </VStack>
            </HStack>
          );
        })}
      </VStack>
    </AddEditBudgetCard>
  );
}

export function CustomSplitsCard({screen}: BudgetSetupBasicSectionProps) {
  const isDarkMode = screen.isDarkMode;
  const totalCustomSplits = screen.customSplits.reduce((sum, s) => sum + s.amount, 0);

  const canAddSplit = Boolean(
    screen.splitDraft.name.trim() &&
    screen.splitDraft.amount.trim() &&
    !Number.isNaN(Number.parseFloat(screen.splitDraft.amount)) &&
    Number.parseFloat(screen.splitDraft.amount) > 0,
  );

  const handleAddSplit = () => {
    if (!canAddSplit) return;
    screen.addCustomSplit({
      name: screen.splitDraft.name.trim(),
      amount: screen.splitDraft.amount.trim(),
    });
  };

  return (
    <AddEditBudgetCard
      title="Other Custom Splits"
      subtitle="Optional allocations that are neither spending, savings, nor fixed bills."
      icon="git-branch"
      accentColor="#6366F1">
      <VStack gap="$3.5">
        {/* Header total if splits exist */}
        {screen.customSplits.length > 0 && (
          <HStack justifyContent="space-between" alignItems="center" paddingBottom="$1">
            <Text variant="caption" color="$textSecondary" weight="medium">
              Total Custom Splits ({screen.customSplits.length})
            </Text>
            <Text variant="body2" color="$text" weight="bold">
              {screen.formatCurrency(totalCustomSplits)}
            </Text>
          </HStack>
        )}

        {/* Existing splits list */}
        {screen.customSplits.length > 0 ? (
          <VStack gap="$2.5">
            {screen.customSplits.map((split) => (
              <XStack
                key={split.id}
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="$3"
                paddingHorizontal="$3.5"
                borderRadius="$4"
                borderWidth={1}
                borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '$borderColor'}
                backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '$surface'}
                gap="$3">
                <View
                  width={40}
                  height={40}
                  borderRadius={12}
                  backgroundColor={
                    isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'
                  }
                  borderWidth={1}
                  borderColor={isDarkMode ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.2)'}
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name="git-branch" size={18} color="#6366F1" />
                </View>

                <VStack flex={1} gap="$0.5">
                  <Text variant="body2" color="$text" weight="bold" numberOfLines={1}>
                    {split.name}
                  </Text>
                  <Text variant="caption" color="$textSecondary">
                    {split.percentage > 0
                      ? `${split.percentage.toFixed(1)}% of planned income`
                      : 'Custom allocation'}
                  </Text>
                </VStack>

                <HStack alignItems="center" gap="$2">
                  <Text variant="body1" color={isDarkMode ? '#818CF8' : '#4F46E5'} weight="bold">
                    {screen.formatCurrency(split.amount)}
                  </Text>

                  <Button
                    variant="ghost"
                    size="small"
                    circular
                    onPress={() => screen.removeSplit(split.id)}
                    accessibilityLabel={`Remove ${split.name} allocation`}
                    leftIcon={
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={isDarkMode ? 'rgba(255, 255, 255, 0.45)' : '$textSecondary'}
                      />
                    }
                  />
                </HStack>
              </XStack>
            ))}
          </VStack>
        ) : (
          <VStack
            alignItems="center"
            justifyContent="center"
            paddingVertical="$4"
            paddingHorizontal="$3.5"
            borderRadius="$4"
            borderWidth={1}
            borderStyle="dashed"
            borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '$borderColor'}
            backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)'}
            gap="$2">
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={isDarkMode ? 'rgba(99, 102, 241, 0.16)' : 'rgba(99, 102, 241, 0.08)'}
              borderWidth={1}
              borderColor={isDarkMode ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.18)'}
              alignItems="center"
              justifyContent="center">
              <Ionicons name="git-branch-outline" size={20} color="#6366F1" />
            </View>
            <VStack gap="$0.5" alignItems="center">
              <Text variant="body2" color="$text" weight="semibold" textAlign="center">
                No custom splits added yet
              </Text>
              <Text variant="caption" color="$textSecondary" textAlign="center" maxWidth={260}>
                Add allocations for things outside your normal bills, spending, or savings.
              </Text>
            </VStack>
          </VStack>
        )}

        {/* Dedicated Add Allocation Form Container */}
        <YStack
          padding="$3.5"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '$borderColor'}
          backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.015)'}
          gap="$3">
          <Text variant="caption" color="$textSecondary" weight="bold">
            NEW ALLOCATION
          </Text>

          <VStack gap="$2">
            <FormField
              accessibilityLabel="Allocation name"
              label="Split Name"
              placeholder="e.g. Vacation Fund, Giving, Allowance"
              size="small"
              value={screen.splitDraft.name}
              onChangeText={screen.setNewSplitName}
              autoCapitalize="words"
              testID="split-name"
            />

            {/* Quick Suggestion Chips */}
            <XStack gap="$1.5" flexWrap="wrap" paddingTop="$0.5">
              {SPLIT_PRESETS.map((preset) => {
                const isSelected = screen.splitDraft.name === preset;
                return (
                  <Button
                    key={preset}
                    variant="ghost"
                    size="small"
                    borderRadius="$3"
                    paddingHorizontal="$2.5"
                    paddingVertical="$1"
                    backgroundColor={
                      isSelected
                        ? isDarkMode
                          ? 'rgba(99, 102, 241, 0.25)'
                          : 'rgba(99, 102, 241, 0.12)'
                        : isDarkMode
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'rgba(0, 0, 0, 0.04)'
                    }
                    borderColor={
                      isSelected
                        ? '#6366F1'
                        : isDarkMode
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '$borderColor'
                    }
                    borderWidth={1}
                    onPress={() => screen.setNewSplitName(preset)}>
                    <Text
                      variant="caption"
                      color={isSelected ? '#818CF8' : '$textSecondary'}
                      weight={isSelected ? 'bold' : 'normal'}>
                      + {preset}
                    </Text>
                  </Button>
                );
              })}
            </XStack>
          </VStack>

          <FormField
            accessibilityLabel="Allocation amount"
            label="Planned Amount"
            placeholder="0.00"
            size="small"
            value={screen.splitDraft.amount}
            onChangeText={screen.handleNewSplitAmountChange}
            keyboardType="decimal-pad"
            testID="split-amount"
            leftIcon={
              <Text color="$textSecondary" weight="bold" fontSize="$4" paddingRight="$1.5">
                {screen.currencySymbol}
              </Text>
            }
          />

          <Button
            variant="primary"
            size="medium"
            onPress={handleAddSplit}
            disabled={!canAddSplit}
            backgroundColor={
              canAddSplit
                ? '#6366F1'
                : isDarkMode
                  ? 'rgba(99, 102, 241, 0.22)'
                  : 'rgba(99, 102, 241, 0.12)'
            }
            borderColor={canAddSplit ? '#4F46E5' : 'transparent'}
            opacity={canAddSplit ? 1 : 0.65}
            leftIcon={
              <Ionicons
                name="add-circle"
                size={18}
                color={
                  canAddSplit
                    ? '#FFFFFF'
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.4)'
                      : '$textSecondary'
                }
              />
            }
            accessibilityLabel="Add other allocation">
            Add Allocation
          </Button>
        </YStack>
      </VStack>
    </AddEditBudgetCard>
  );
}

export function BudgetSummaryCard({screen}: BudgetSetupBasicSectionProps) {
  const rows = [
    ['Planned Income', screen.totals.incomeAmount],
    ['Flexible Spending', screen.totals.expensesAmount],
    ['Fixed Commitments (Loans & Subs)', screen.totals.totalCommittedAmount],
    ['Planned Savings Target', screen.totals.savingsAmount],
  ] as const;

  return (
    <AddEditBudgetCard
      title="Plan Summary"
      subtitle="Overview of your total budget allocations."
      icon="receipt"
      accentColor="#10B981">
      <VStack gap="$3">
        {rows.map(([label, amount]) => (
          <HStack key={label} justifyContent="space-between" gap="$3">
            <Text variant="body2" color="$textSecondary">
              {label}
            </Text>
            <Text variant="body2" color="$text" weight="semibold">
              {screen.formatCurrency(amount)}
            </Text>
          </HStack>
        ))}
        <HStack
          justifyContent="space-between"
          paddingTop="$2"
          borderTopWidth={1}
          borderColor="$borderColor">
          <Text variant="body1" color="$text" weight="bold">
            Unallocated Amount
          </Text>
          <Text
            variant="body1"
            color={screen.totals.remainingAmount >= 0 ? '$green10' : '$red10'}
            weight="bold">
            {screen.formatCurrency(screen.totals.remainingAmount)}
          </Text>
        </HStack>
      </VStack>
    </AddEditBudgetCard>
  );
}
