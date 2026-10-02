import {useCallback, useMemo, useState} from 'react';
import {useTheme} from 'tamagui';
import dayjs from 'dayjs';

import {useAuth, useBudget, useCategory, useSettings, useTransaction} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {getUserTransactionAmountForType} from '@/features/transactions/transactionAmounts';

export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  icon?: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface TrendChartPoint {
  value: number;
  label: string;
  dateStr: string;
  dataPointText?: string;
}

export interface FinancialHealthBreakdown {
  score: number;
  rating: 'Excellent' | 'Healthy' | 'Fair' | 'Needs Attention';
  tone: 'positive' | 'info' | 'warning' | 'negative';
  savingsScore: number;
  budgetScore: number;
  trendScore: number;
  insights: string[];
}

export interface TopExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon?: string;
}

export interface AnalyticsScreenModel {
  screenId: string;
  selectedPeriod: AnalyticsPeriod;
  setSelectedPeriod: (period: AnalyticsPeriod) => void;
  formatCurrency: (amount: number) => string;
  currency: string;
  isDarkMode: boolean;
  headerIconColor: string;
  refreshing: boolean;
  onRefresh: () => void;

  // Overview metrics
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  dailyAverage: number;
  transactionCount: number;

  // Comparison metrics vs prior period
  priorExpenses: number;
  priorIncome: number;
  expenseChangePct: number;
  incomeChangePct: number;
  netChangePct: number;

  // Budget integration
  hasActiveBudget: boolean;
  budgetLimit: number;
  budgetRemaining: number;
  budgetUsagePct: number;

  // Charts data
  trendData: TrendChartPoint[];
  peakDay: {date: string; amount: number} | null;
  categoryBreakdown: CategoryBreakdownItem[];
  pieData: Array<{
    value: number;
    color: string;
    text: string;
    percentage: string;
    label: string;
  }>;

  // Health score & intelligence
  financialHealth: FinancialHealthBreakdown;

  // Top transactions
  topExpenses: TopExpenseItem[];
}

const FALLBACK_CATEGORY_COLORS = [
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CFF', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const tokenValue = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

export const useAnalyticsScreen = (): AnalyticsScreenModel => {
  const {transactions} = useTransaction();
  const {user} = useAuth();
  const {categories} = useCategory();
  const {activeBudget} = useBudget();
  const {formatCurrency, currency} = useSettings();
  const {isDarkMode} = useTamaguiTheme();
  const theme = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('month');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  // Compute date ranges for current and prior periods
  const {currentRange, priorRange, daysInPeriod} = useMemo(() => {
    const now = dayjs();
    let currentStart: dayjs.Dayjs;
    let currentEnd: dayjs.Dayjs = now.endOf('day');
    let priorStart: dayjs.Dayjs;
    let priorEnd: dayjs.Dayjs;
    let days: number;

    switch (selectedPeriod) {
      case 'week': {
        // Last 7 days
        currentStart = now.subtract(6, 'day').startOf('day');
        priorStart = now.subtract(13, 'day').startOf('day');
        priorEnd = now.subtract(7, 'day').endOf('day');
        days = 7;
        break;
      }
      case 'month': {
        // Current month
        currentStart = now.startOf('month');
        const elapsed = now.date();
        days = Math.max(1, elapsed);
        priorStart = now.subtract(1, 'month').startOf('month');
        priorEnd = now
          .subtract(1, 'month')
          .date(Math.min(elapsed, now.subtract(1, 'month').daysInMonth()))
          .endOf('day');
        break;
      }
      case 'quarter': {
        // Last 3 months
        currentStart = now.subtract(2, 'month').startOf('month');
        days = Math.max(1, now.diff(currentStart, 'day') + 1);
        priorStart = now.subtract(5, 'month').startOf('month');
        priorEnd = now.subtract(3, 'month').endOf('month');
        break;
      }
      case 'year': {
        // Current year to date
        currentStart = now.startOf('year');
        days = Math.max(1, now.diff(currentStart, 'day') + 1);
        priorStart = now.subtract(1, 'year').startOf('year');
        priorEnd = now.subtract(1, 'year').endOf('year');
        break;
      }
    }

    return {
      currentRange: {start: currentStart, end: currentEnd},
      priorRange: {start: priorStart, end: priorEnd},
      daysInPeriod: days,
    };
  }, [selectedPeriod]);

  // Current period transactions
  const periodFilteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = dayjs(tx.date);
      return (
        (txDate.isAfter(currentRange.start) || txDate.isSame(currentRange.start, 'day')) &&
        (txDate.isBefore(currentRange.end) || txDate.isSame(currentRange.end, 'day'))
      );
    });
  }, [currentRange, transactions]);

  // Prior period transactions
  const priorFilteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = dayjs(tx.date);
      return (
        (txDate.isAfter(priorRange.start) || txDate.isSame(priorRange.start, 'day')) &&
        (txDate.isBefore(priorRange.end) || txDate.isSame(priorRange.end, 'day'))
      );
    });
  }, [priorRange, transactions]);

  // Financial totals for current period
  const totalIncome = useMemo(() => {
    return periodFilteredTransactions.reduce((sum, tx) => {
      return sum + getUserTransactionAmountForType(tx, 'income', user?.uid);
    }, 0);
  }, [periodFilteredTransactions, user?.uid]);

  const totalExpenses = useMemo(() => {
    return periodFilteredTransactions.reduce((sum, tx) => {
      return sum + getUserTransactionAmountForType(tx, 'expense', user?.uid);
    }, 0);
  }, [periodFilteredTransactions, user?.uid]);

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const dailyAverage = totalExpenses > 0 ? totalExpenses / daysInPeriod : 0;

  // Financial totals for prior period
  const priorIncome = useMemo(() => {
    return priorFilteredTransactions.reduce((sum, tx) => {
      return sum + getUserTransactionAmountForType(tx, 'income', user?.uid);
    }, 0);
  }, [priorFilteredTransactions, user?.uid]);

  const priorExpenses = useMemo(() => {
    return priorFilteredTransactions.reduce((sum, tx) => {
      return sum + getUserTransactionAmountForType(tx, 'expense', user?.uid);
    }, 0);
  }, [priorFilteredTransactions, user?.uid]);

  const priorNet = priorIncome - priorExpenses;

  // Percentage changes vs prior period
  const expenseChangePct = useMemo(() => {
    if (priorExpenses === 0) return totalExpenses > 0 ? 100 : 0;
    return ((totalExpenses - priorExpenses) / priorExpenses) * 100;
  }, [priorExpenses, totalExpenses]);

  const incomeChangePct = useMemo(() => {
    if (priorIncome === 0) return totalIncome > 0 ? 100 : 0;
    return ((totalIncome - priorIncome) / priorIncome) * 100;
  }, [priorIncome, totalIncome]);

  const netChangePct = useMemo(() => {
    if (priorNet === 0) return netBalance > 0 ? 100 : netBalance < 0 ? -100 : 0;
    return ((netBalance - priorNet) / Math.abs(priorNet)) * 100;
  }, [netBalance, priorNet]);

  // Active budget metrics
  const hasActiveBudget = Boolean(activeBudget && activeBudget.plannedExpenses > 0);
  const budgetLimit = activeBudget?.plannedExpenses ?? 0;
  const budgetRemaining = budgetLimit > 0 ? budgetLimit - totalExpenses : 0;
  const budgetUsagePct =
    budgetLimit > 0 ? Math.min(100, Math.max(0, (totalExpenses / budgetLimit) * 100)) : 0;

  // Trend chart points tailored to the selected period
  const {trendData, peakDay} = useMemo(() => {
    const expenseTxList = periodFilteredTransactions.filter(
      (tx) => getUserTransactionAmountForType(tx, 'expense', user?.uid) > 0,
    );

    let points: TrendChartPoint[] = [];
    let maxExpense = 0;
    let maxDateStr = '';

    if (selectedPeriod === 'week') {
      // 7 daily points: start from 6 days ago up to today
      const start = dayjs().subtract(6, 'day');
      for (let i = 0; i < 7; i++) {
        const d = start.add(i, 'day');
        const dayKey = d.format('YYYY-MM-DD');
        const dayTotal = expenseTxList
          .filter((tx) => dayjs(tx.date).format('YYYY-MM-DD') === dayKey)
          .reduce((sum, tx) => sum + getUserTransactionAmountForType(tx, 'expense', user?.uid), 0);

        if (dayTotal > maxExpense) {
          maxExpense = dayTotal;
          maxDateStr = d.format('ddd, MMM D');
        }

        points.push({
          value: dayTotal,
          label: d.format('ddd'),
          dateStr: dayKey,
        });
      }
    } else if (selectedPeriod === 'month') {
      // Group by weeks within current month (W1: 1-7, W2: 8-14, W3: 15-21, W4: 22-28, W5: 29+)
      const now = dayjs();
      const daysInCurrentMonth = now.daysInMonth();
      const weekBuckets = [
        {label: 'W1', start: 1, end: 7},
        {label: 'W2', start: 8, end: 14},
        {label: 'W3', start: 15, end: 21},
        {label: 'W4', start: 22, end: 28},
      ];
      if (daysInCurrentMonth > 28) {
        weekBuckets.push({label: 'W5', start: 29, end: daysInCurrentMonth});
      }

      weekBuckets.forEach((bucket) => {
        const weekTotal = expenseTxList
          .filter((tx) => {
            const txDate = dayjs(tx.date);
            if (txDate.month() !== now.month() || txDate.year() !== now.year()) return false;
            const dayNum = txDate.date();
            return dayNum >= bucket.start && dayNum <= bucket.end;
          })
          .reduce((sum, tx) => sum + getUserTransactionAmountForType(tx, 'expense', user?.uid), 0);

        if (weekTotal > maxExpense) {
          maxExpense = weekTotal;
          maxDateStr = `${bucket.label} (${now.format('MMM')} ${bucket.start}-${bucket.end})`;
        }

        points.push({
          value: weekTotal,
          label: bucket.label,
          dateStr: `${now.format('MMM')} ${bucket.start}-${bucket.end}`,
        });
      });
    } else if (selectedPeriod === 'quarter') {
      // Last 3 months
      const now = dayjs();
      for (let i = 2; i >= 0; i--) {
        const m = now.subtract(i, 'month');
        const monthTotal = expenseTxList
          .filter((tx) => {
            const txDate = dayjs(tx.date);
            return txDate.month() === m.month() && txDate.year() === m.year();
          })
          .reduce((sum, tx) => sum + getUserTransactionAmountForType(tx, 'expense', user?.uid), 0);

        if (monthTotal > maxExpense) {
          maxExpense = monthTotal;
          maxDateStr = m.format('MMMM YYYY');
        }

        points.push({
          value: monthTotal,
          label: m.format('MMM'),
          dateStr: m.format('MMMM YYYY'),
        });
      }
    } else {
      // 12 months in the current year
      const now = dayjs();
      const currentYear = now.year();
      for (let m = 0; m < 12; m++) {
        const monthDate = dayjs(new Date(currentYear, m, 1));
        const monthTotal = expenseTxList
          .filter((tx) => {
            const txDate = dayjs(tx.date);
            return txDate.year() === currentYear && txDate.month() === m;
          })
          .reduce((sum, tx) => sum + getUserTransactionAmountForType(tx, 'expense', user?.uid), 0);

        if (monthTotal > maxExpense) {
          maxExpense = monthTotal;
          maxDateStr = monthDate.format('MMMM YYYY');
        }

        points.push({
          value: monthTotal,
          label: monthDate.format('MMM'),
          dateStr: monthDate.format('MMMM YYYY'),
        });
      }
    }

    return {
      trendData: points,
      peakDay: maxExpense > 0 ? {date: maxDateStr, amount: maxExpense} : null,
    };
  }, [periodFilteredTransactions, selectedPeriod, user?.uid]);

  // Category breakdown
  const categoryBreakdown = useMemo<CategoryBreakdownItem[]>(() => {
    const categoryMap = new Map<string, {amount: number; count: number}>();

    const expenseTxList = periodFilteredTransactions.filter(
      (tx) => getUserTransactionAmountForType(tx, 'expense', user?.uid) > 0,
    );

    expenseTxList.forEach((tx) => {
      const matchedCategory = categories.find(
        (c) =>
          c.id === tx.categoryId ||
          c.id === tx.category ||
          c.name.toLowerCase() === (tx.category ?? '').toLowerCase(),
      );
      const categoryKey = matchedCategory?.id ?? tx.categoryId ?? tx.category ?? 'uncategorized';
      const existing = categoryMap.get(categoryKey) ?? {amount: 0, count: 0};

      categoryMap.set(categoryKey, {
        amount: existing.amount + getUserTransactionAmountForType(tx, 'expense', user?.uid),
        count: existing.count + 1,
      });
    });

    const entries = Array.from(categoryMap.entries()).sort((a, b) => b[1].amount - a[1].amount);

    return entries.map(([catKey, data], index) => {
      const matchedCategory = categories.find(
        (c) => c.id === catKey || c.name.toLowerCase() === catKey.toLowerCase(),
      );
      const name = matchedCategory?.name ?? (catKey === 'uncategorized' ? 'Other' : catKey);
      const color =
        matchedCategory?.color || FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length];
      const percentage = totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0;

      return {
        id: catKey,
        name,
        icon: matchedCategory?.icon,
        color,
        amount: data.amount,
        percentage,
        transactionCount: data.count,
      };
    });
  }, [categories, periodFilteredTransactions, totalExpenses, user?.uid]);

  // Pie chart data derived from category breakdown
  const pieData = useMemo(() => {
    return categoryBreakdown.map((item) => ({
      value: item.amount,
      color: item.color,
      text: `${Math.round(item.percentage)}%`,
      percentage: `${item.percentage.toFixed(1)}%`,
      label: item.name,
    }));
  }, [categoryBreakdown]);

  // Financial health score & actionable insights
  const financialHealth = useMemo<FinancialHealthBreakdown>(() => {
    // 1. Savings Score (0-40 pts)
    let savingsScore = 20;
    if (totalIncome > 0) {
      if (savingsRate >= 30) savingsScore = 40;
      else if (savingsRate >= 20) savingsScore = 35;
      else if (savingsRate >= 10) savingsScore = 25;
      else if (savingsRate >= 0) savingsScore = 15;
      else savingsScore = 5;
    }

    // 2. Budget / Cash Flow Score (0-35 pts)
    let budgetScore = 25;
    if (hasActiveBudget && budgetLimit > 0) {
      const ratio = totalExpenses / budgetLimit;
      if (ratio <= 0.8) budgetScore = 35;
      else if (ratio <= 1.0) budgetScore = 28;
      else if (ratio <= 1.15) budgetScore = 18;
      else budgetScore = 8;
    } else if (totalIncome > 0) {
      if (totalExpenses <= totalIncome * 0.7) budgetScore = 35;
      else if (totalExpenses <= totalIncome) budgetScore = 25;
      else budgetScore = 10;
    }

    // 3. Trajectory vs Prior Period (0-25 pts)
    let trendScore = 18;
    if (priorExpenses > 0) {
      if (expenseChangePct <= -10) trendScore = 25;
      else if (expenseChangePct <= 0) trendScore = 22;
      else if (expenseChangePct <= 10) trendScore = 18;
      else if (expenseChangePct <= 25) trendScore = 12;
      else trendScore = 6;
    }

    const totalScore = Math.min(100, Math.max(0, savingsScore + budgetScore + trendScore));

    let rating: FinancialHealthBreakdown['rating'] = 'Fair';
    let tone: FinancialHealthBreakdown['tone'] = 'warning';

    if (totalScore >= 85) {
      rating = 'Excellent';
      tone = 'positive';
    } else if (totalScore >= 70) {
      rating = 'Healthy';
      tone = 'positive';
    } else if (totalScore >= 50) {
      rating = 'Fair';
      tone = 'warning';
    } else {
      rating = 'Needs Attention';
      tone = 'negative';
    }

    // Build intelligent, contextual insights
    const insights: string[] = [];

    if (totalIncome > 0) {
      if (savingsRate >= 20) {
        insights.push(
          `Healthy savings rate of ${savingsRate.toFixed(0)}%, surpassing the recommended 20% benchmark.`,
        );
      } else if (savingsRate > 0) {
        insights.push(
          `You saved ${formatCurrency(netBalance)} (${savingsRate.toFixed(0)}% of income) during this period.`,
        );
      } else {
        insights.push(
          `Outflow exceeded income by ${formatCurrency(Math.abs(netBalance))} this period.`,
        );
      }
    }

    if (categoryBreakdown.length > 0) {
      const topCat = categoryBreakdown[0];
      insights.push(
        `${topCat.name} was your largest spending category at ${topCat.percentage.toFixed(0)}% (${formatCurrency(topCat.amount)}).`,
      );
    }

    if (priorExpenses > 0) {
      if (expenseChangePct < -5) {
        insights.push(
          `Spending decreased by ${Math.abs(expenseChangePct).toFixed(0)}% compared to the prior period.`,
        );
      } else if (expenseChangePct > 5) {
        insights.push(
          `Spending increased by ${expenseChangePct.toFixed(0)}% compared to the prior period.`,
        );
      } else {
        insights.push('Spending remained steady and consistent with the prior period.');
      }
    } else if (hasActiveBudget) {
      insights.push(`Budget utilization is currently at ${budgetUsagePct.toFixed(0)}%.`);
    }

    return {
      score: totalScore,
      rating,
      tone,
      savingsScore,
      budgetScore,
      trendScore,
      insights: insights.slice(0, 3),
    };
  }, [
    budgetLimit,
    budgetUsagePct,
    categoryBreakdown,
    expenseChangePct,
    formatCurrency,
    hasActiveBudget,
    netBalance,
    priorExpenses,
    savingsRate,
    totalExpenses,
    totalIncome,
  ]);

  // Top 5 largest expenses in this period
  const topExpenses = useMemo<TopExpenseItem[]>(() => {
    const expenseTxList = periodFilteredTransactions
      .filter((tx) => getUserTransactionAmountForType(tx, 'expense', user?.uid) > 0)
      .sort((a, b) => {
        const amtA = getUserTransactionAmountForType(a, 'expense', user?.uid);
        const amtB = getUserTransactionAmountForType(b, 'expense', user?.uid);
        return amtB - amtA;
      })
      .slice(0, 5);

    return expenseTxList.map((tx) => {
      const matchedCategory = categories.find(
        (c) =>
          c.id === tx.categoryId ||
          c.id === tx.category ||
          c.name.toLowerCase() === (tx.category ?? '').toLowerCase(),
      );
      const amount = getUserTransactionAmountForType(tx, 'expense', user?.uid);

      return {
        id: tx.id,
        description: tx.description || matchedCategory?.name || 'Expense',
        amount,
        date: dayjs(tx.date).format('MMM D, YYYY'),
        categoryName: matchedCategory?.name || 'Other',
        categoryColor: matchedCategory?.color || '#3B82F6',
        categoryIcon: matchedCategory?.icon,
      };
    });
  }, [categories, periodFilteredTransactions, user?.uid]);

  return {
    screenId: 'analytics',
    selectedPeriod,
    setSelectedPeriod,
    formatCurrency,
    currency,
    isDarkMode,
    headerIconColor: tokenValue(theme.color?.val, '#000000'),
    refreshing,
    onRefresh,

    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate,
    dailyAverage,
    transactionCount: periodFilteredTransactions.length,

    priorExpenses,
    priorIncome,
    expenseChangePct,
    incomeChangePct,
    netChangePct,

    hasActiveBudget,
    budgetLimit,
    budgetRemaining,
    budgetUsagePct,

    trendData,
    peakDay,
    categoryBreakdown,
    pieData,

    financialHealth,
    topExpenses,
  };
};
