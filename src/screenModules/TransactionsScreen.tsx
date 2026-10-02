import {FloatingAction} from '@ravitamil/buddy-ui';
import React from 'react';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {GroupFilterModal} from '@/features/groups/components/GroupFilterModal';
import {
  SortOptionsSheet,
  TransactionsListSection,
  useTransactionsScreenModel,
} from '@/features/transactions';

export default function TransactionsScreen() {
  const model = useTransactionsScreenModel();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={model.title}
        subtitle={model.subtitle}
        largeTitle={model.title}
        mode="collapsing"
        onBackPress={model.handleBackPress}
        {...model.headerProps}
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <TransactionsListSection
          transactions={model.filteredAndSortedTransactions}
          isDarkMode={model.isDarkMode}
          searchText={model.searchText}
          selectedType={model.selectedType}
          selectedCategory={model.selectedCategory}
          selectedGroups={model.selectedGroups}
          showNoGroups={model.showNoGroups}
          sortBy={model.sortBy}
          visibleCategories={model.visibleCategories}
          summary={model.summary}
          analyticsData={model.analyticsData}
          showAnalytics={model.showAnalytics}
          formatCurrency={model.formatCurrency}
          onScroll={model.onScroll}
          onSearchChange={model.setSearchText}
          onOpenSort={() => model.setShowSortModal(true)}
          onCycleSort={model.cycleSort}
          onOpenGroupFilter={() => model.setShowGroupFilterModal(true)}
          onSelectType={model.setSelectedType}
          onSelectCategory={model.setSelectedCategory}
          onToggleNoGroups={() => model.setShowNoGroups(!model.showNoGroups)}
          getTransactionItem={model.getTransactionItem}
          onTransactionPress={model.navigateTransaction}
          onAddTransaction={model.navigateAddTransaction}
        />
      </ScreenWrapper>

      <SortOptionsSheet
        isOpen={model.showSortModal}
        onClose={() => model.setShowSortModal(false)}
        selectedSort={model.sortBy}
        onSelectSort={model.setSortBy}
      />

      <GroupFilterModal
        isOpen={model.showGroupFilterModal}
        onClose={() => model.setShowGroupFilterModal(false)}
        groups={model.groups}
        selectedGroups={model.selectedGroups}
        onGroupSelect={model.setSelectedGroups}
      />

      <FloatingAction
        presentation="circular"
        icon="add"
        position="right"
        variant="info"
        label="Add transaction"
        isScrollingDown={model.isScrollingDown}
        actions={[
          {
            id: 'expense',
            label: 'Add Expense',
            icon: 'arrow-up',
            variant: 'danger',
            onPress: () => model.navigateAddTransactionWithType('expense'),
          },
          {
            id: 'income',
            label: 'Add Income',
            icon: 'arrow-down',
            variant: 'success',
            onPress: () => model.navigateAddTransactionWithType('income'),
          },
        ]}
      />
    </ScreenContainer>
  );
}
