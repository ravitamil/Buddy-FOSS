/**
 * Smart Budget Service
 *
 * Provides intelligent budget suggestions and recommendations based on:
 * - Historical spending patterns
 * - Income and expense trends
 * - Category-based analysis
 * - Seasonal variations
 * - Financial goals alignment
 *
 * P2-003: Smart Budget Suggestions Service Implementation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Budget, BudgetSuggestion, Category, SpendingPattern, Transaction} from '../types';
import {calculateBudgetHealthScore, predictSpending} from './smartBudget/budgetHealth';
import {
  calculateCategorySpending,
  calculateGoalAdjustment,
  calculateImpact,
  calculatePriority,
  calculateSuggestedBudget,
  createGoalSuggestion,
  generateReason,
  sortBudgetSuggestions,
} from './smartBudget/budgetSuggestionHelpers';
import {parseJson, parseSpendingHistory, parseSpendingPatterns} from './smartBudget/parsers';
import {analyzeSpendingPatternsData} from './smartBudget/spendingPatternAnalyzer';
import {
  BudgetHealthScore,
  FinancialGoal,
  SpendingHistory,
  SpendingPrediction,
} from './smartBudget/types';
import {logger as appLogger} from './LoggerService';

const STORAGE_KEYS = {
  SPENDING_HISTORY: 'smart_budget_spending_history',
  SUGGESTIONS: 'smart_budget_suggestions',
  PATTERNS: 'smart_budget_patterns',
};

export class SmartBudgetService {
  private static instance: SmartBudgetService;
  private initialized = false;
  private spendingHistory: SpendingHistory[] = [];
  private spendingPatterns: SpendingPattern[] = [];

  private constructor() {}

  static getInstance(): SmartBudgetService {
    if (!SmartBudgetService.instance) {
      SmartBudgetService.instance = new SmartBudgetService();
    }
    return SmartBudgetService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadCachedData();
      this.initialized = true;
    } catch (error) {
      appLogger.error('SmartBudgetService initialization failed:', error);
      this.initialized = true;
    }
  }

  async analyzeSpendingPatterns(
    transactions: Transaction[],
    categories: Category[],
  ): Promise<SpendingPattern[]> {
    const patterns = analyzeSpendingPatternsData(transactions, categories);
    this.spendingPatterns = patterns;

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(patterns));
    } catch (error) {
      appLogger.error('Failed to save spending patterns:', error);
    }

    return patterns;
  }

  async generateBudgetSuggestions(
    currentBudget: Budget,
    transactions: Transaction[],
    categories: Category[],
    goals?: FinancialGoal[],
  ): Promise<BudgetSuggestion[]> {
    await this.initialize();

    if (this.spendingPatterns.length === 0) {
      await this.analyzeSpendingPatterns(transactions, categories);
    }

    const suggestions = this.buildCategorySuggestions(currentBudget, transactions);

    if (goals && goals.length > 0) {
      const goalAdjustment = calculateGoalAdjustment(goals, transactions);
      if (goalAdjustment > 0) {
        suggestions.push(createGoalSuggestion(currentBudget, goals, goalAdjustment));
      }
    }

    sortBudgetSuggestions(suggestions);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(suggestions));
    } catch (error) {
      appLogger.error('Failed to save suggestions:', error);
    }

    return suggestions;
  }

  getCategoryInsights(categoryId: string): SpendingPattern | undefined {
    return this.spendingPatterns.find((pattern) => pattern.categoryId === categoryId);
  }

  getBudgetHealthScore(currentBudget: Budget, transactions: Transaction[]): BudgetHealthScore {
    return calculateBudgetHealthScore(currentBudget, transactions);
  }

  predictNextMonthSpending(categoryId: string, months: number = 3): SpendingPrediction {
    const pattern = this.spendingPatterns.find((item) => item.categoryId === categoryId);
    return predictSpending(pattern, months);
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SPENDING_HISTORY,
        STORAGE_KEYS.SUGGESTIONS,
        STORAGE_KEYS.PATTERNS,
      ]);
      this.spendingHistory = [];
      this.spendingPatterns = [];
    } catch (error) {
      appLogger.error('Failed to clear cache:', error);
    }
  }

  private async loadCachedData(): Promise<void> {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.SPENDING_HISTORY);
      const patterns = await AsyncStorage.getItem(STORAGE_KEYS.PATTERNS);

      if (history) {
        this.spendingHistory = parseSpendingHistory(parseJson(history));
      }
      if (patterns) {
        this.spendingPatterns = parseSpendingPatterns(parseJson(patterns));
      }
    } catch (error) {
      appLogger.error('Failed to load cached data:', error);
    }
  }

  private buildCategorySuggestions(
    currentBudget: Budget,
    transactions: Transaction[],
  ): BudgetSuggestion[] {
    const suggestions: BudgetSuggestion[] = [];
    const categorySpending = calculateCategorySpending(transactions);

    currentBudget.categoryAllocations?.forEach((allocation) => {
      const actualSpending = categorySpending.get(allocation.categoryId) || 0;
      const suggestedAmount = calculateSuggestedBudget(
        allocation.categoryId,
        actualSpending,
        allocation.amount,
        this.spendingPatterns,
      );

      if (suggestedAmount === allocation.amount) {
        return;
      }

      const pattern = this.spendingPatterns.find(
        (item) => item.categoryId === allocation.categoryId,
      );

      suggestions.push({
        categoryId: allocation.categoryId,
        categoryName: allocation.categoryName,
        currentBudget: allocation.amount,
        suggestedBudget: suggestedAmount,
        reason: generateReason(actualSpending, suggestedAmount, pattern),
        priority: calculatePriority(actualSpending, allocation.amount, pattern),
        expectedImpact: calculateImpact(actualSpending, suggestedAmount),
        createdAt: new Date().toISOString(),
        isAccepted: false,
      });
    });

    return suggestions;
  }
}

export default SmartBudgetService;
