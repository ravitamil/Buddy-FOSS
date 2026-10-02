import {FloatingAction, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  CategorySection,
  DescriptionSection,
  RecurrenceSection,
  TransactionCategorySheet,
  TransactionHeroAmountCard,
  TransactionWalletSheet,
  WalletSection,
} from '@/features/transactions/components/AddTransactionFormSections';
import {BudgetGuardrailCard} from '@/features/transactions/components/addTransactionForm/BudgetGuardrailCard';
import {useAddTransactionScreenModel} from '@/features/transactions/hooks/useAddTransactionScreenModel';

const scrollViewStyle = {
  flex: 1,
  backgroundColor: 'transparent',
} as const;

const scrollContentStyle = {
  paddingTop: 118,
  paddingBottom: 160,
} as const;

export default function AddTransactionScreen() {
  const model = useAddTransactionScreenModel();

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
        <CustomNavigationHeader
          title={model.title}
          subtitle={model.subtitle}
          largeTitle={model.title}
          mode="collapsing"
          {...model.headerProps}
          onBackPress={model.onBackPress}
        />

        <ScreenWrapper
          edges={[]}
          backgroundColor="transparent"
          padding={false}
          keyboardMode="aware-scroll"
          onScroll={model.onScroll}
          contentContainerStyle={scrollContentStyle}
          scrollViewStyle={scrollViewStyle}
          keyboardBottomOffset={100}>
          <VStack flex={1} padding="$4" gap="$4">
            <TransactionHeroAmountCard
              amount={model.amount}
              currencyPrefix={model.currencyPrefix}
              isIncome={model.isIncome}
              selectedDate={model.selectedDate}
              showDatePicker={model.showDatePicker}
              transactionType={model.transactionType}
              onAddQuickAmount={model.addQuickAmount}
              onAmountChange={model.handleAmountChange}
              onAmountSubmit={model.handleDescriptionSubmit}
              onDateChange={model.onDateChange}
              onOpenDatePicker={() => model.setShowDatePicker(true)}
              onSelectType={model.selectTransactionType}
            />

            <DescriptionSection
              description={model.description}
              isExpanded={model.isDescriptionExpanded}
              isIncome={model.isIncome}
              onChangeDescription={model.setDescription}
              onSubmitDescription={model.handleDescriptionSubmit}
              onToggleExpanded={model.toggleDescriptionExpand}
            />

            <CategorySection
              availableCategories={model.availableCategories}
              selectedCategory={model.selectedCategory}
              onAddCategory={model.navigateAddCategory}
              onOpenCategorySheet={() => model.setShowCategorySheet(true)}
              onSelectCategory={model.setSelectedCategory}
            />

            <WalletSection
              wallets={model.wallets}
              selectedWalletId={model.selectedWalletId}
              formatCurrency={model.formatCurrency}
              onOpenWalletSheet={() => model.setShowWalletSheet(true)}
              onSelectWallet={model.setSelectedWalletId}
            />

            <BudgetGuardrailCard
              guardrail={model.budgetGuardrail}
              formatCurrency={model.formatCurrency}
            />

            <RecurrenceSection
              isRecurring={model.isRecurring}
              recurrenceEndDate={model.recurrenceEndDate}
              recurrenceFrequency={model.recurrenceFrequency}
              recurrenceFrequencies={model.recurrenceFrequencies}
              selectedDate={model.selectedDate}
              showRecurrenceEndPicker={model.showRecurrenceEndPicker}
              onClearEndDate={() => model.setRecurrenceEndDate(null)}
              onEndDateChange={model.onRecurrenceEndDateChange}
              onOpenEndPicker={() => model.setShowRecurrenceEndPicker(true)}
              onSelectFrequency={model.setRecurrenceFrequency}
              onToggleRecurring={model.setIsRecurring}
            />
          </VStack>
        </ScreenWrapper>

        <FloatingAction
          presentation="save"
          variant={model.isIncome ? 'success' : 'primary'}
          isScrollingDown={model.isScrollingDown}
          onPress={() => {
            void model.saveTransaction();
          }}
          disabled={!model.canSave || model.isSaving}
          loading={model.isSaving}
          label={
            model.isSaving
              ? `${model.isEditMode ? 'Updating' : 'Saving'} ${model.isIncome ? 'Income' : 'Expense'}...`
              : `${model.isEditMode ? 'Update' : 'Save'} ${model.isIncome ? 'Income' : 'Expense'}`
          }
        />

        <TransactionCategorySheet
          isOpen={model.showCategorySheet}
          onClose={() => model.setShowCategorySheet(false)}
          categories={model.availableCategories}
          selectedCategory={model.selectedCategory}
          onSelectCategory={model.setSelectedCategory}
          onAddCategory={model.navigateAddCategory}
        />

        <TransactionWalletSheet
          isOpen={model.showWalletSheet}
          onClose={() => model.setShowWalletSheet(false)}
          wallets={model.wallets}
          selectedWalletId={model.selectedWalletId}
          onSelectWallet={model.setSelectedWalletId}
          formatCurrency={model.formatCurrency}
        />
      </ScreenContainer>
    </GestureHandlerRootView>
  );
}
