import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React, {useEffect, useState} from 'react';

import {SmartBudgetService} from '@/services/SmartBudgetService';
import {logger as appLogger} from '@/services/LoggerService';
import type {Budget, BudgetSuggestion, Category, SavingsGoal, Transaction} from '@/types';
import {useAuth} from '@/context/AuthContext';
import {getBudgetTransactionAmount} from '../model/budgetCycle';

const logger = appLogger.contextLogger('SmartBudgetSuggestionsCard');

interface SmartBudgetSuggestionsCardProps {
  budget: Budget;
  categories: Category[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  formatCurrency: (amount: number) => string;
}

export function SmartBudgetSuggestionsCard({
  budget,
  categories,
  transactions,
  savingsGoals,
  formatCurrency,
}: SmartBudgetSuggestionsCardProps) {
  const [suggestions, setSuggestions] = useState<BudgetSuggestion[]>([]);
  const {user} = useAuth();

  useEffect(() => {
    let isCurrent = true;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const recentTransactions = transactions
      .filter((transaction) => new Date(transaction.date) >= cutoff)
      .map((transaction) =>
        transaction.type === 'expense'
          ? {
              ...transaction,
              amount: -getBudgetTransactionAmount(transaction, user?.uid),
            }
          : transaction,
      )
      .filter((transaction) => transaction.type !== 'expense' || transaction.amount !== 0);
    const goals = savingsGoals
      .filter((goal) => goal.currentAmount < goal.targetAmount)
      .map((goal) => ({
        targetSavings: Math.max(0, goal.targetAmount - goal.currentAmount),
        timeline: Math.max(
          1,
          Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (30 * 86_400_000)),
        ),
        currentProgress: goal.currentAmount,
      }));

    void SmartBudgetService.getInstance()
      .generateBudgetSuggestions(budget, recentTransactions, categories, goals)
      .then((result) => {
        if (isCurrent) setSuggestions(result.slice(0, 3));
      })
      .catch((error) => logger.warn('Unable to generate budget suggestions', error));

    return () => {
      isCurrent = false;
    };
  }, [budget, categories, savingsGoals, transactions, user?.uid]);

  if (suggestions.length === 0) return null;

  return (
    <GlassSurface>
      <VStack gap="$3">
        <VStack gap="$1">
          <Text variant="h5" color="$color" weight="bold">
            Smart Adjustments
          </Text>
          <Text variant="caption" color="$colorSubtitle">
            Based on the last 90 days of category spending
          </Text>
        </VStack>
        {suggestions.map((suggestion) => (
          <VStack key={`${suggestion.categoryId}-${suggestion.createdAt}`} gap="$1">
            <HStack alignItems="center" justifyContent="space-between" gap="$3">
              <Text variant="body1" color="$color" weight="semibold" flex={1}>
                {suggestion.categoryName}
              </Text>
              <Text variant="body2" color="$blue11" weight="semibold">
                {formatCurrency(suggestion.suggestedBudget)}
              </Text>
            </HStack>
            <Text variant="caption" color="$colorSubtitle">
              {suggestion.reason}
            </Text>
          </VStack>
        ))}
      </VStack>
    </GlassSurface>
  );
}
