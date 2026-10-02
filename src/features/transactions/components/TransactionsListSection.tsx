import {Button, GlassSurface, HStack, SearchField, Text, VStack} from '@ravitamil/buddy-ui';
import React, {useCallback, useMemo} from 'react';
import Animated from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import StandardFlashList from '@/components/ui/StandardFlashList';
import type {Transaction} from '@/types';
import type {
  TransactionAnalyticsDatum,
  TransactionCategoryItem,
  TransactionListItemViewModel,
  TransactionSortOption,
  TransactionSummary,
  TransactionTypeFilter,
} from '../types';
import {TransactionAnalyticsCard} from './TransactionAnalyticsCard';
import {TransactionFilterControls} from './TransactionFilterControls';
import {TransactionItem} from './TransactionItem';
import {TransactionSummaryCards} from './TransactionSummaryCards';

const AnimatedTransactionsFlashList = Animated.createAnimatedComponent(
  StandardFlashList<Transaction>,
);

export interface TransactionsListSectionProps {
  transactions: Transaction[];
  isDarkMode: boolean;
  searchText: string;
  selectedType: TransactionTypeFilter;
  selectedCategory: string;
  selectedGroups: string[];
  showNoGroups: boolean;
  sortBy: TransactionSortOption;
  visibleCategories: TransactionCategoryItem[];
  summary: TransactionSummary;
  analyticsData: TransactionAnalyticsDatum[];
  showAnalytics: boolean;
  formatCurrency: (amount: number) => string;
  onScroll?: React.ComponentProps<typeof AnimatedTransactionsFlashList>['onScroll'];
  onSearchChange: (text: string) => void;
  onOpenSort: () => void;
  onCycleSort?: () => void;
  onOpenGroupFilter: () => void;
  onSelectType: (type: TransactionTypeFilter) => void;
  onSelectCategory: (categoryId: string) => void;
  onToggleNoGroups: () => void;
  getTransactionItem: (transaction: Transaction) => TransactionListItemViewModel;
  onTransactionPress: (transaction: Transaction) => void;
  onAddTransaction: () => void;
}

export function TransactionsListSection({
  transactions,
  isDarkMode,
  searchText,
  selectedType,
  selectedCategory,
  selectedGroups,
  showNoGroups,
  sortBy,
  visibleCategories,
  summary,
  analyticsData,
  showAnalytics,
  formatCurrency,
  onScroll,
  onSearchChange,
  onOpenSort,
  onCycleSort,
  onOpenGroupFilter,
  onSelectType,
  onSelectCategory,
  onToggleNoGroups,
  getTransactionItem,
  onTransactionPress,
  onAddTransaction,
}: TransactionsListSectionProps) {
  const insets = useSafeAreaInsets();
  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: insets.top > 0 ? insets.top + 64 : 96,
      paddingBottom: Math.max(insets.bottom + 80, 120),
    }),
    [insets.bottom, insets.top],
  );

  const hasActiveFilters =
    Boolean(searchText) ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedGroups.length > 0;

  const renderItem = useCallback(
    ({item}: {item: Transaction}) => {
      const viewModel = getTransactionItem(item);
      return (
        <TransactionItem
          key={item.id}
          {...viewModel}
          onPress={() => onTransactionPress(item)}
          formatCurrency={formatCurrency}
        />
      );
    },
    [formatCurrency, getTransactionItem, onTransactionPress],
  );

  const renderListHeader = useCallback(
    () => (
      <VStack gap="$4" paddingBottom="$3">
        <SearchField
          value={searchText}
          onChangeText={onSearchChange}
          placeholder="Search transactions..."
        />

        <TransactionSummaryCards
          summary={summary}
          isDarkMode={isDarkMode}
          formatCurrency={formatCurrency}
        />

        <TransactionFilterControls
          isDarkMode={isDarkMode}
          selectedType={selectedType}
          selectedCategory={selectedCategory}
          selectedGroups={selectedGroups}
          showNoGroups={showNoGroups}
          sortBy={sortBy}
          visibleCategories={visibleCategories}
          onOpenSort={onOpenSort}
          onCycleSort={onCycleSort}
          onOpenGroupFilter={onOpenGroupFilter}
          onSelectType={onSelectType}
          onSelectCategory={onSelectCategory}
          onToggleNoGroups={onToggleNoGroups}
        />

        {showAnalytics && (
          <TransactionAnalyticsCard
            data={analyticsData}
            isDarkMode={isDarkMode}
            isVisible={showAnalytics}
          />
        )}

        <HStack justifyContent="space-between" alignItems="center" marginTop="$2">
          <Text variant="h4" color="$color" weight="bold">
            Transactions
          </Text>
          <Text variant="caption" color="$colorSubtitle">
            {transactions.length} record{transactions.length !== 1 ? 's' : ''}
          </Text>
        </HStack>
      </VStack>
    ),
    [
      analyticsData,
      formatCurrency,
      isDarkMode,
      onCycleSort,
      onOpenGroupFilter,
      onSearchChange,
      onSelectCategory,
      onSelectType,
      onToggleNoGroups,
      searchText,
      selectedCategory,
      selectedGroups,
      selectedType,
      showAnalytics,
      showNoGroups,
      sortBy,
      summary,
      transactions.length,
      visibleCategories,
    ],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <TransactionEmptyState
        hasActiveFilters={hasActiveFilters}
        selectedType={selectedType}
        onAddTransaction={onAddTransaction}
      />
    ),
    [hasActiveFilters, onAddTransaction, selectedType],
  );

  return (
    <AnimatedTransactionsFlashList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderListHeader}
      ListEmptyComponent={renderEmptyComponent}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={listContentContainerStyle}
      keyboardShouldPersistTaps="handled"
    />
  );
}

interface TransactionEmptyStateProps {
  hasActiveFilters: boolean;
  selectedType: string;
  onAddTransaction: () => void;
}

function TransactionEmptyState({
  hasActiveFilters,
  selectedType,
  onAddTransaction,
}: TransactionEmptyStateProps) {
  const emptyTitle = hasActiveFilters
    ? 'No matching transactions'
    : selectedType === 'income'
      ? 'No income transactions yet'
      : selectedType === 'expense'
        ? 'No expense transactions yet'
        : 'No transactions recorded';

  const emptySubtitle = hasActiveFilters
    ? 'Try clearing search or filters to see more results.'
    : selectedType === 'income'
      ? 'Add your salary, freelance, or dividend earnings.'
      : selectedType === 'expense'
        ? 'Track where your money goes by adding an expense.'
        : 'Start logging your inflows and outflows to take control of your finances.';

  return (
    <GlassSurface padding="$6" borderRadius={18}>
      <VStack alignItems="center" gap="$4" paddingVertical="$2">
        <YStack
          width={64}
          height={64}
          borderRadius={32}
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center">
          <Ionicons
            name={
              selectedType === 'income'
                ? 'arrow-down-circle-outline'
                : selectedType === 'expense'
                  ? 'arrow-up-circle-outline'
                  : 'receipt-outline'
            }
            size={32}
            color="$iconBrand"
          />
        </YStack>

        <VStack alignItems="center" gap="$1" maxWidth={280}>
          <Text variant="h4" color="$color" weight="bold" textAlign="center">
            {emptyTitle}
          </Text>
          <Text variant="body2" color="$colorSubtitle" textAlign="center">
            {emptySubtitle}
          </Text>
        </VStack>

        {!hasActiveFilters && (
          <Button
            variant="primary"
            onPress={onAddTransaction}
            minHeight={44}
            paddingHorizontal="$5">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text color="#ffffff" weight="bold" variant="body2">
                {selectedType === 'income' ? 'Add Income' : 'Add Transaction'}
              </Text>
            </XStack>
          </Button>
        )}
      </VStack>
    </GlassSurface>
  );
}
