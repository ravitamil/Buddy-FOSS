import {SpendingPattern} from '../../types';
import {SpendingHistory} from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const parseJson = (value: string): unknown => JSON.parse(value) as unknown;

export const parseSpendingHistory = (value: unknown): SpendingHistory[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): SpendingHistory[] => {
    if (
      !isRecord(item) ||
      typeof item.category !== 'string' ||
      !isRecord(item.monthlyAmounts) ||
      typeof item.averageAmount !== 'number' ||
      typeof item.variance !== 'number'
    ) {
      return [];
    }

    const monthlyAmounts = Object.fromEntries(
      Object.entries(item.monthlyAmounts).filter(
        (entry): entry is [string, number] => typeof entry[1] === 'number',
      ),
    );

    return [
      {
        category: item.category,
        monthlyAmounts,
        averageAmount: item.averageAmount,
        variance: item.variance,
      },
    ];
  });
};

export const parseSpendingPatterns = (value: unknown): SpendingPattern[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): SpendingPattern[] => {
    if (
      !isRecord(item) ||
      typeof item.categoryId !== 'string' ||
      typeof item.categoryName !== 'string' ||
      typeof item.averageAmount !== 'number' ||
      typeof item.trend !== 'string' ||
      typeof item.volatility !== 'number' ||
      !Array.isArray(item.monthlyAmounts) ||
      typeof item.lastUpdated !== 'string'
    ) {
      return [];
    }

    if (item.trend !== 'increasing' && item.trend !== 'decreasing' && item.trend !== 'stable') {
      return [];
    }

    return [
      {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        averageAmount: item.averageAmount,
        trend: item.trend,
        volatility: item.volatility,
        monthlyAmounts: item.monthlyAmounts.filter(
          (amount): amount is number => typeof amount === 'number',
        ),
        lastUpdated: item.lastUpdated,
      },
    ];
  });
};
