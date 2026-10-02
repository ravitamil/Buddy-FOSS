import {semanticHexColor} from '@ravitamil/buddy-ui';
import type {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {Category, Transaction} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';
import {getUserTransactionAmountForType} from '../transactionAmounts';
import type {
  TransactionAnalyticsDatum,
  TransactionCategoryItem,
  TransactionGroupingOption,
  TransactionGroupSection,
  TransactionListItemViewModel,
  TransactionSortOption,
  TransactionSummary,
  TransactionTypeFilter,
} from '../types';
import {
  getGroupExpenseSettlementStatus,
  getSettlementDescription,
  isSettlementTransaction,
} from '../transactionPresentation';

const analyticsFallbackColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
];

type RuntimeCategoryValue = string | {id?: string; name?: string};

export const getPageTitle = (): string => 'Transactions';

export const normalizeCategories = (categories: Category[]): TransactionCategoryItem[] =>
  categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type,
  }));

export const filterAndSortTransactions = ({
  transactions,
  categories,
  groupById,
  formatCurrency,
  searchText,
  selectedType,
  selectedCategory,
  selectedGroups,
  showNoGroups,
  sortBy,
}: {
  transactions: Transaction[];
  categories: Category[];
  groupById: Map<string, EnhancedGroup>;
  formatCurrency: (amount: number) => string;
  searchText: string;
  selectedType: TransactionTypeFilter;
  selectedCategory: string;
  selectedGroups: string[];
  showNoGroups: boolean;
  sortBy: TransactionSortOption;
}): Transaction[] => {
  const searchLower = searchText.trim().toLowerCase();
  const filtered = transactions.filter((transaction) => {
    if (selectedType !== 'all' && transaction.type !== selectedType) {
      return false;
    }

    const categoryValue = getTransactionCategoryValue(transaction);
    const categoryId = getCategoryId(categoryValue);
    if (selectedCategory !== 'all' && categoryId !== selectedCategory) {
      return false;
    }

    if (selectedGroups.length > 0) {
      return Boolean(transaction.groupId && selectedGroups.includes(transaction.groupId));
    }

    if (showNoGroups && transaction.groupId) {
      return false;
    }

    if (!searchLower) {
      return true;
    }

    const categoryInfo = findCategory(categories, categoryValue);
    const groupInfo = transaction.groupId ? groupById.get(transaction.groupId) : undefined;

    return (
      transaction.description.toLowerCase().includes(searchLower) ||
      getCategoryLabel(categoryValue).toLowerCase().includes(searchLower) ||
      Boolean(categoryInfo?.name.toLowerCase().includes(searchLower)) ||
      Boolean(groupInfo?.name.toLowerCase().includes(searchLower)) ||
      Boolean(transaction.groupName?.toLowerCase().includes(searchLower)) ||
      formatCurrency(transaction.amount).toLowerCase().includes(searchLower)
    );
  });

  return sortTransactions(filtered, sortBy);
};

export const groupTransactions = ({
  transactions,
  groupBy,
  groupById,
}: {
  transactions: Transaction[];
  groupBy: TransactionGroupingOption;
  groupById: Map<string, EnhancedGroup>;
}): TransactionGroupSection[] => {
  if (groupBy === 'none') {
    return [{title: '', data: transactions}];
  }

  const groupsData = transactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
    const groupKey = getTransactionGroupKey(transaction, groupBy, groupById);
    acc[groupKey] ??= [];
    acc[groupKey].push(transaction);
    return acc;
  }, {});

  return Object.entries(groupsData).map(([title, data]) => ({title, data}));
};

export const summarizeTransactions = (
  transactions: Transaction[],
  userId?: string,
): TransactionSummary => {
  const totalIncome = transactions.reduce(
    (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'income', userId),
    0,
  );
  const totalExpenses = transactions.reduce(
    (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense', userId),
    0,
  );

  return {
    totalIncome,
    totalExpenses,
    netAmount: totalIncome - totalExpenses,
  };
};

export const createAnalyticsData = (
  transactions: Transaction[],
  categories: Category[],
  userId?: string,
): TransactionAnalyticsDatum[] => {
  const expenseTransactions = transactions.filter(
    (transaction) => getUserTransactionAmountForType(transaction, 'expense', userId) > 0,
  );
  const totalExpenseAmount = expenseTransactions.reduce(
    (sum, transaction) => sum + getUserTransactionAmountForType(transaction, 'expense', userId),
    0,
  );

  if (totalExpenseAmount === 0) {
    return [];
  }

  const dataByCategory = expenseTransactions.reduce<Record<string, number>>((acc, transaction) => {
    const categoryId = getCategoryId(getTransactionCategoryValue(transaction));
    acc[categoryId] =
      (acc[categoryId] ?? 0) + getUserTransactionAmountForType(transaction, 'expense', userId);
    return acc;
  }, {});

  return Object.entries(dataByCategory).map(([category, amount], index) => {
    const categoryInfo = categories.find((item) => item.name === category || item.id === category);

    return {
      value: amount,
      color: categoryInfo?.color ?? analyticsFallbackColors[index % analyticsFallbackColors.length],
      label: categoryInfo?.name ?? category,
      text: `${((amount / totalExpenseAmount) * 100).toFixed(1)}%`,
    };
  });
};

export const createTransactionItem = ({
  transaction,
  categories,
  groupById,
  currentUserId,
  currentUserName,
}: {
  transaction: Transaction;
  categories: Category[];
  groupById: Map<string, EnhancedGroup>;
  currentUserId?: string;
  currentUserName?: string;
}): TransactionListItemViewModel => {
  const categoryValue = getTransactionCategoryValue(transaction);
  const categoryInfo = findCategory(categories, categoryValue);
  const groupInfo = transaction.groupId ? groupById.get(transaction.groupId) : undefined;

  const isSettlement = isSettlementTransaction(transaction);

  const category = isSettlement
    ? {
        name: 'Settlement' as string,
        icon: 'swap-horizontal' as keyof typeof Ionicons.glyphMap,
        color: semanticHexColor('success'),
      }
    : {
        name: categoryInfo?.name ?? getCategoryLabel(categoryValue),
        icon: categoryInfo?.icon ?? 'help-circle',
        color: categoryInfo?.color ?? '#4ECDC4',
      };

  return {
    id: transaction.id,
    description: isSettlement
      ? getSettlementDescription({
          transaction,
          group: groupInfo,
          currentUserId,
          currentUserName,
        })
      : transaction.description,
    amount: transaction.amount,
    date: new Date(transaction.date).toLocaleDateString(),
    type: transaction.type,
    category,
    groupName: transaction.groupId ? (groupInfo?.name ?? transaction.groupName ?? null) : null,
    groupEmoji: groupInfo?.emoji ?? transaction.groupEmoji,
    settlementStatus: isSettlement
      ? 'settled'
      : getGroupExpenseSettlementStatus(transaction, groupInfo, currentUserId),
    isRecurring: transaction.isRecurring ?? false,
    recurrenceFrequency: transaction.recurrenceFrequency,
  };
};

const getCategoryId = (category: RuntimeCategoryValue): string => {
  if (typeof category === 'string') {
    return category;
  }

  return category.id ?? category.name ?? 'Uncategorized';
};

const getCategoryLabel = (category: RuntimeCategoryValue): string => {
  if (typeof category === 'string') {
    return category;
  }

  return category.name ?? category.id ?? 'Uncategorized';
};

const getTransactionCategoryValue = (transaction: Transaction): RuntimeCategoryValue =>
  transaction.category;

const findCategory = (
  categories: Category[],
  categoryValue: RuntimeCategoryValue,
): Category | undefined => {
  const categoryId = getCategoryId(categoryValue);
  return categories.find((category) => category.id === categoryId || category.name === categoryId);
};

const sortTransactions = (
  transactions: Transaction[],
  sortBy: TransactionSortOption,
): Transaction[] =>
  [...transactions].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount-desc':
        return Math.abs(b.amount) - Math.abs(a.amount);
      case 'amount-asc':
        return Math.abs(a.amount) - Math.abs(b.amount);
      case 'category':
        return getCategoryLabel(getTransactionCategoryValue(a)).localeCompare(
          getCategoryLabel(getTransactionCategoryValue(b)),
        );
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

const getTransactionGroupKey = (
  transaction: Transaction,
  groupBy: Exclude<TransactionGroupingOption, 'none'>,
  groupById: Map<string, EnhancedGroup>,
): string => {
  switch (groupBy) {
    case 'date':
      return new Date(transaction.date).toDateString();
    case 'category':
      return getCategoryLabel(getTransactionCategoryValue(transaction));
    case 'group': {
      const groupInfo = transaction.groupId ? groupById.get(transaction.groupId) : undefined;
      return groupInfo?.name ?? transaction.groupName ?? 'Individual';
    }
    case 'type':
      return transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
  }
};
