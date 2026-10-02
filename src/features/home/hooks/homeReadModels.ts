import {semanticHexColor} from '@ravitamil/buddy-ui';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {Budget, Category, Transaction} from '@/types';
import type {BudgetCycleModel} from '@/features/budgets/model/budgetCycle';
import {
  getUserTransactionAmount,
  getUserTransactionAmountForType,
} from '@/features/transactions/transactionAmounts';
import {
  getGroupExpenseSettlementStatus,
  getSettlementDescription,
  isSettlementTransaction,
  type TransactionGroupLike,
} from '@/features/transactions/transactionPresentation';

import type {
  HomeGroupCardViewModel,
  HomeScreenModel,
  HomeStatCardViewModel,
  HomeStatTrend,
  HomeStatType,
  HomeTransactionViewModel,
} from '../types';

const groupIconMap: Partial<Record<string, keyof typeof Ionicons.glyphMap>> = {
  '✈️': 'airplane',
  '🍽️': 'restaurant',
  '🎬': 'film',
  '🏠': 'home',
  '💼': 'briefcase',
  '🎉': 'happy',
  '🚗': 'car',
  '🏖️': 'sunny',
  '📚': 'library',
  '💪': 'fitness',
};

const groupColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

interface HomeGroupLike extends TransactionGroupLike {
  transactions?: Transaction[];
}

interface FinancialSummaryLike {
  totalIncome: number;
  totalExpenses: number;
}

export interface HomeFinancialData {
  income: number;
  expenses: number;
  savings: number;
}

interface HomeReadModelDependencies {
  navigate: (path: string) => void;
}

const getMonthBounds = (referenceDate: Date) => ({
  lastMonth: new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1),
  currentMonth: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
});

const sumTransactions = (
  transactions: Transaction[],
  predicate: (transaction: Transaction) => boolean,
  userId?: string,
) =>
  transactions.filter(predicate).reduce((sum, transaction) => {
    return sum + getUserTransactionAmount(transaction, userId);
  }, 0);

export const calculateMonthlyPercentage = (
  transactions: Transaction[],
  type: HomeStatType,
  referenceDate = new Date(),
  userId?: string,
) => {
  const {lastMonth, currentMonth} = getMonthBounds(referenceDate);
  const isLastMonth = (transaction: Transaction) => {
    const date = new Date(transaction.date);
    return date >= lastMonth && date < currentMonth;
  };
  const isCurrentMonth = (transaction: Transaction) => new Date(transaction.date) >= currentMonth;
  const matchesType = (transaction: Transaction, transactionType: Transaction['type']) => {
    return transaction.type === transactionType;
  };
  const sumForPeriod = (
    transactionType: Transaction['type'],
    periodPredicate: (transaction: Transaction) => boolean,
  ) =>
    sumTransactions(
      transactions,
      (transaction) => matchesType(transaction, transactionType) && periodPredicate(transaction),
      userId,
    );

  const lastIncome = sumForPeriod('income', isLastMonth);
  const lastExpenses = sumForPeriod('expense', isLastMonth);
  const currentIncome = sumForPeriod('income', isCurrentMonth);
  const currentExpenses = sumForPeriod('expense', isCurrentMonth);
  const lastMonthValue =
    type === 'income' ? lastIncome : type === 'expense' ? lastExpenses : lastIncome - lastExpenses;
  const currentMonthValue =
    type === 'income'
      ? currentIncome
      : type === 'expense'
        ? currentExpenses
        : currentIncome - currentExpenses;

  if (lastMonthValue === 0) {
    if (currentMonthValue > 0) return '+100.0';
    if (currentMonthValue < 0) return '-100.0';
    return '0.0';
  }

  const percentage = ((currentMonthValue - lastMonthValue) / Math.abs(lastMonthValue)) * 100;
  if (Math.abs(percentage) < 0.05) return '0.0';
  return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}`;
};

export const getStatTrendInfo = (
  percentage: string,
  type: HomeStatType,
): {
  trend: HomeStatTrend;
  percentageColor: string;
  percentageIcon: keyof typeof Ionicons.glyphMap;
} => {
  const isPositiveChange = percentage.startsWith('+');
  const isNegativeChange = percentage.startsWith('-');

  if (!isPositiveChange && !isNegativeChange) {
    return {
      trend: 'neutral',
      percentageColor: '#9CA3AF',
      percentageIcon: 'remove',
    };
  }

  if (type === 'expense') {
    return {
      trend: isPositiveChange ? 'negative' : 'positive',
      percentageColor: isPositiveChange ? '#EF4444' : '#10B981',
      percentageIcon: isPositiveChange ? 'arrow-up' : 'arrow-down',
    };
  }

  return {
    trend: isPositiveChange ? 'positive' : 'negative',
    percentageColor: isPositiveChange ? '#10B981' : '#EF4444',
    percentageIcon: isPositiveChange ? 'arrow-up' : 'arrow-down',
  };
};

export const createFinancialData = (summary: FinancialSummaryLike): HomeFinancialData => ({
  income: summary.totalIncome,
  expenses: summary.totalExpenses,
  savings: summary.totalIncome - summary.totalExpenses,
});

export const createBudgetData = (
  budget?: Budget | null,
  cycle?: BudgetCycleModel | null,
): HomeScreenModel['budgetData'] => {
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    budgetName: budget?.name,
    period: budget?.period,
    daysRemaining: cycle?.daysRemaining ?? 0,
    periodLabel:
      budget?.period === 'weekly'
        ? 'This Week'
        : budget?.period === 'yearly'
          ? String(new Date().getFullYear())
          : budget?.period === 'custom'
            ? (budget.name ?? 'Custom Period')
            : now.toLocaleDateString(undefined, {month: 'long'}),
    periodStart: (cycle?.period.start ?? defaultStart).toISOString(),
    periodEndExclusive: (cycle?.period.endExclusive ?? defaultEnd).toISOString(),
    monthlyIncome: budget?.monthlyIncome ?? 0,
    plannedExpenses: budget?.plannedExpenses ?? 0,
    plannedSavings: budget?.plannedSavings ?? 0,
    actualSpent: cycle?.actualSpent ?? 0,
    actualIncome: cycle?.actualIncome ?? 0,
    totalSpendingPlan: cycle
      ? cycle.plannedVariableSpending + cycle.totalCommitted
      : (budget?.plannedExpenses ?? 0),
    remainingSpending: cycle?.remainingSpending ?? budget?.plannedExpenses ?? 0,
    utilizationPercentage: cycle?.utilizationPercentage ?? 0,
    dailySafeToSpend: cycle?.dailySafeToSpend ?? 0,
    customSplits: budget?.customSplits ?? [],
    monthlyLoanEMIs: cycle?.committedLoans ?? 0,
    monthlySubscriptions: cycle?.committedSubscriptions ?? 0,
    monthlyRecurringExpenses: cycle?.committedRecurringExpenses ?? 0,
    financialHealthScore: cycle?.financialHealthScore ?? 0,
    topBudgetCategories: (cycle?.categoryProgress ?? [])
      .filter((category) => category.spent > 0)
      .sort((first, second) => second.spent - first.spent)
      .slice(0, 2)
      .map((category) => ({
        name: category.categoryName,
        amount: category.spent,
        icon: category.icon ?? 'ellipsis-horizontal',
        color: category.color ?? '#94A3B8',
      })),
  };
};

interface CreateHomeStatCardsParams extends HomeReadModelDependencies {
  transactions: Transaction[];
  financialData: HomeFinancialData;
  formatCurrency: (amount: number) => string;
  referenceDate?: Date;
  userId?: string;
}

export const createHomeStatCards = ({
  transactions,
  financialData,
  formatCurrency,
  navigate,
  referenceDate,
  userId,
}: CreateHomeStatCardsParams): HomeStatCardViewModel[] => {
  const incomePercentage = calculateMonthlyPercentage(
    transactions,
    'income',
    referenceDate,
    userId,
  );
  const expensePercentage = calculateMonthlyPercentage(
    transactions,
    'expense',
    referenceDate,
    userId,
  );
  const savingsPercentage = calculateMonthlyPercentage(
    transactions,
    'investment',
    referenceDate,
    userId,
  );

  const incomeTrend = getStatTrendInfo(incomePercentage, 'income');
  const expenseTrend = getStatTrendInfo(expensePercentage, 'expense');
  const savingsTrend = getStatTrendInfo(savingsPercentage, 'investment');

  return [
    {
      title: 'Income',
      value: formatCurrency(financialData.income),
      icon: 'trending-up',
      percentage: `${incomePercentage}%`,
      percentageColor: incomeTrend.percentageColor,
      percentageIcon: incomeTrend.percentageIcon,
      trend: incomeTrend.trend,
      type: 'income',
      onPress: () => navigate('/transactions?type=income'),
      onDoublePress: () => navigate('/add-transaction?type=income'),
    },
    {
      title: 'Expense',
      value: formatCurrency(financialData.expenses),
      icon: 'trending-down',
      percentage: `${expensePercentage}%`,
      percentageColor: expenseTrend.percentageColor,
      percentageIcon: expenseTrend.percentageIcon,
      trend: expenseTrend.trend,
      type: 'expense',
      onPress: () => navigate('/transactions?type=expense'),
      onDoublePress: () => navigate('/add-transaction?type=expense'),
    },
    {
      title: 'Savings',
      value: formatCurrency(financialData.savings),
      icon: 'wallet',
      percentage: `${savingsPercentage}%`,
      percentageColor: savingsTrend.percentageColor,
      percentageIcon: savingsTrend.percentageIcon,
      trend: savingsTrend.trend,
      type: 'investment',
      onPress: () => navigate('/savings-portfolio'),
      onDoublePress: () => navigate('/add-savings-goal'),
    },
  ];
};

const getGroupIcon = (emoji?: string): keyof typeof Ionicons.glyphMap => {
  return emoji ? (groupIconMap[emoji] ?? 'people') : 'people';
};

interface CreateHomeGroupCardsParams extends HomeReadModelDependencies {
  groups: HomeGroupLike[];
  formatCurrency: (amount: number) => string;
  userId?: string;
}

export const createHomeGroupCards = ({
  groups,
  formatCurrency,
  navigate,
  userId,
}: CreateHomeGroupCardsParams): HomeGroupCardViewModel[] =>
  groups.slice(0, 3).map((group) => {
    const members = group.members ?? [];
    const groupTransactions = group.transactions ?? [];
    const totalAmount = groupTransactions.reduce(
      (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense'),
      0,
    );
    const yourShare = userId
      ? groupTransactions.reduce(
          (sum, transaction) =>
            sum + getUserTransactionAmountForType(transaction, 'expense', userId),
          0,
        )
      : members.length > 0
        ? totalAmount / members.length
        : 0;
    const color = groupColors[group.name.length % groupColors.length] ?? groupColors[0];

    return {
      id: group.id,
      name: group.name,
      props: {
        id: group.id,
        name: group.name,
        members: members.length,
        totalAmount,
        yourShare,
        icon: getGroupIcon(group.emoji),
        emoji: group.emoji,
        color,
        onPress: () => navigate(`/groups/${group.id}`),
        onAddExpense: () => navigate(`/groups/${group.id}/add-transaction`),
        onMore: () => undefined,
        formatCurrency,
      },
    };
  });

const getCategoryForTransaction = (
  transaction: Transaction,
  categories: Category[],
): HomeTransactionViewModel['category'] => {
  if (isSettlementTransaction(transaction)) {
    return {
      name: 'Settlement',
      icon: 'swap-horizontal',
      color: semanticHexColor('success'),
    };
  }

  if (transaction.loanId) {
    const debtCategory = categories.find((c) => c.name.toLowerCase() === 'debt');
    return {
      name: debtCategory?.name || 'Debt',
      icon: debtCategory?.icon || 'card',
      color: debtCategory?.color || '#F44336',
    };
  }

  const categoryInfo = categories.find((category) => {
    return category.id === transaction.categoryId || category.name === transaction.category;
  });

  return categoryInfo
    ? {
        name: categoryInfo.name,
        icon: categoryInfo.icon,
        color: categoryInfo.color,
      }
    : {
        name: transaction.category || 'Uncategorized',
        icon: 'help-circle',
        // eslint-disable-next-line development-quality/enforce-tamagui-usage -- LinearGradientView requires a valid hex color
        color: '#94A3B8',
      };
};

interface CreateHomeTransactionItemsParams extends HomeReadModelDependencies {
  transactions: Transaction[];
  categories: Category[];
  groups?: HomeGroupLike[];
  currentUserId?: string;
  currentUserName?: string;
}

export const createHomeTransactionItems = ({
  transactions,
  categories,
  navigate,
  groups,
  currentUserId,
  currentUserName,
}: CreateHomeTransactionItemsParams): HomeTransactionViewModel[] => {
  // Build a lookup map for groups
  const groupById = new Map<string, HomeGroupLike>();
  if (groups) {
    for (const group of groups) {
      groupById.set(group.id, group);
    }
  }

  return transactions.slice(0, 5).map((transaction) => {
    const group = transaction.groupId ? groupById.get(transaction.groupId) : undefined;

    const isSettlement = isSettlementTransaction(transaction);

    // Resolve group metadata
    const groupName = group?.name ?? transaction.groupName ?? null;
    const groupEmoji = group?.emoji ?? transaction.groupEmoji;

    // Build description — clean up settlement titles
    const description = isSettlement
      ? getSettlementDescription({transaction, group, currentUserId, currentUserName})
      : transaction.description;

    // Settlement status
    const settlementStatus = isSettlement
      ? ('settled' as const)
      : transaction.groupId
        ? getGroupExpenseSettlementStatus(transaction, group, currentUserId)
        : undefined;

    return {
      id: transaction.id,
      description,
      amount: transaction.amount,
      date: new Date(transaction.date).toLocaleDateString(),
      type: transaction.type,
      category: getCategoryForTransaction(transaction, categories),
      groupName,
      groupEmoji,
      settlementStatus,
      onPress: () =>
        navigate(
          transaction.groupId
            ? `/groups/${transaction.groupId}/transactions/${transaction.id}`
            : `/transactions/${transaction.id}`,
        ),
      isRecurring: transaction.isRecurring ?? false,
      recurrenceFrequency: transaction.recurrenceFrequency,
    };
  });
};
