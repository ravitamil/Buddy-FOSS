import {useCallback, useEffect, useMemo, useState} from 'react';
import {BackHandler} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {useCategory} from '@/context/CategoryContext';
import {useAuth} from '@/context/AuthContext';
import {useGroups} from '@/context/GroupContext';
import {useSettings} from '@/context/SettingsContext';
import {useTransaction} from '@/context/TransactionContext';
import {useUser} from '@/context/UserContext';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {logger as appLogger} from '@/services/LoggerService';
import type {Transaction} from '@/types';

import type {
  TransactionGroupingOption,
  TransactionListItemViewModel,
  TransactionSortOption,
  TransactionTypeFilter,
} from '../types';
import {
  createAnalyticsData,
  createTransactionItem,
  filterAndSortTransactions,
  getPageTitle,
  groupTransactions,
  normalizeCategories,
  summarizeTransactions,
} from './transactionsScreenModelUtils';

const logger = appLogger.contextLogger('TransactionsScreen');
type TransactionRouteType = Extract<TransactionTypeFilter, 'income' | 'expense'>;

export function useTransactionsScreenModel() {
  const router = useRouter();
  const {type} = useLocalSearchParams<{type?: TransactionRouteType}>();
  const {transactions: allTransactions} = useTransaction();
  const {categories} = useCategory();
  const {groups} = useGroups();
  const {formatCurrency} = useSettings();
  const {user} = useAuth();
  const {profile} = useUser();
  const {onScroll, headerProps, isScrollingDown, scrollY} = useProgressiveBlurHeader({
    showBackButtonInNonBlur: false,
  });
  const {isDarkMode} = useTamaguiTheme();

  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionTypeFilter>(type ?? 'all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<TransactionSortOption>('date-desc');
  const [groupBy, setGroupBy] = useState<TransactionGroupingOption>('none');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGroupFilterModal, setShowGroupFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showNoGroups, setShowNoGroups] = useState(false);

  // Intercept hardware back press when any sheet/modal is open
  useEffect(() => {
    if (!showSortModal && !showGroupFilterModal) return;

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showSortModal) {
        setShowSortModal(false);
        return true;
      }
      if (showGroupFilterModal) {
        setShowGroupFilterModal(false);
        return true;
      }
      return false;
    });

    return () => backSubscription.remove();
  }, [showGroupFilterModal, showSortModal]);

  const handleBackPress = useCallback(() => {
    if (showSortModal) {
      setShowSortModal(false);
      return;
    }
    if (showGroupFilterModal) {
      setShowGroupFilterModal(false);
      return;
    }
    router.back();
  }, [router, showGroupFilterModal, showSortModal]);

  const groupItems = groups.items;

  const groupById = useMemo(
    () => new Map(groupItems.map((group) => [group.id, group] as const)),
    [groupItems],
  );

  const categoryItems = useMemo(() => normalizeCategories(categories), [categories]);

  const visibleCategoryItems = useMemo(
    () =>
      selectedType === 'all'
        ? categoryItems
        : categoryItems.filter((category) => category.type === selectedType),
    [categoryItems, selectedType],
  );

  const filteredAndSortedTransactions = useMemo(() => {
    logger.debug('TransactionsScreen filtering started', {
      totalTransactions: allTransactions.length,
      selectedGroups,
      selectedGroupsLength: selectedGroups.length,
    });

    const filtered = filterAndSortTransactions({
      transactions: allTransactions,
      categories,
      groupById,
      formatCurrency,
      searchText,
      selectedType,
      selectedCategory,
      selectedGroups,
      showNoGroups,
      sortBy,
    });

    logger.debug('TransactionsScreen filtered transactions count', {
      filteredCount: filtered.length,
    });

    return filtered;
  }, [
    allTransactions,
    categories,
    formatCurrency,
    groupById,
    searchText,
    selectedCategory,
    selectedGroups,
    selectedType,
    showNoGroups,
    sortBy,
  ]);

  const groupedTransactions = useMemo(
    () => groupTransactions({transactions: filteredAndSortedTransactions, groupBy, groupById}),
    [filteredAndSortedTransactions, groupBy, groupById],
  );
  const summary = useMemo(
    () => summarizeTransactions(filteredAndSortedTransactions, user?.uid),
    [filteredAndSortedTransactions, user?.uid],
  );
  const analyticsData = useMemo(
    () => createAnalyticsData(filteredAndSortedTransactions, categories, user?.uid),
    [categories, filteredAndSortedTransactions, user?.uid],
  );

  const hasActiveFilters =
    Boolean(searchText) ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedGroups.length > 0;

  const cycleSort = useCallback(() => {
    const options: TransactionSortOption[] = ['date-desc', 'date-asc', 'amount-desc', 'amount-asc'];
    setSortBy((current) => {
      const currentIndex = options.indexOf(current);
      const nextIndex = (currentIndex + 1) % options.length;
      return options[nextIndex];
    });
  }, []);

  const navigateAddTransaction = useCallback(() => {
    router.push('/add-transaction');
  }, [router]);

  const navigateAddTransactionWithType = useCallback(
    (type: 'income' | 'expense') => {
      router.push(`/add-transaction?type=${type}`);
    },
    [router],
  );

  const navigateTransaction = useCallback(
    (transaction: Transaction) => {
      if (transaction.groupId) {
        router.push(`/groups/${transaction.groupId}/transactions/${transaction.id}`);
      } else {
        router.push(`/transactions/${transaction.id}`);
      }
    },
    [router],
  );

  const getTransactionItem = useCallback(
    (transaction: Transaction): TransactionListItemViewModel => {
      return createTransactionItem({
        transaction,
        categories,
        groupById,
        currentUserId: user?.uid,
        currentUserName:
          profile?.displayName ?? profile?.firstName ?? user?.displayName ?? undefined,
      });
    },
    [categories, groupById, profile?.displayName, profile?.firstName, user?.displayName, user?.uid],
  );

  return {
    title: getPageTitle(),
    subtitle: `${filteredAndSortedTransactions.length} transaction${
      filteredAndSortedTransactions.length !== 1 ? 's' : ''
    }`,
    allTransactions,
    filteredAndSortedTransactions,
    groupedTransactions,
    summary,
    analyticsData,
    categories: categoryItems,
    visibleCategories: visibleCategoryItems,
    groups: groupItems,
    searchText,
    selectedType,
    selectedCategory,
    selectedGroups,
    sortBy,
    groupBy,
    showAnalytics,
    showGroupFilterModal,
    showSortModal,
    showNoGroups,
    hasActiveFilters,
    isDarkMode,
    formatCurrency,
    onScroll,
    isScrollingDown,
    scrollY,
    headerProps,
    handleBackPress,
    setSearchText,
    setSelectedType,
    setSelectedCategory,
    setSelectedGroups,
    setSortBy,
    setGroupBy,
    setShowAnalytics,
    setShowGroupFilterModal,
    setShowSortModal,
    setShowNoGroups,
    cycleSort,
    navigateAddTransaction,
    navigateAddTransactionWithType,
    navigateTransaction,
    getTransactionItem,
  };
}
