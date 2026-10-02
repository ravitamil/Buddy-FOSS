import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('@ravitamil/buddy-ui/overlays', () => ({
  BottomSheet: ({children, open}: {children: React.ReactNode; open: boolean}) =>
    open ? children : null,
  BottomSheetOption: () => null,
}));

import type {UseBudgetSetupScreenResult} from '../hooks/useBudgetSetupScreen';
import {BudgetSetupSections} from './BudgetSetupSections';

const createScreen = (
  overrides?: Partial<UseBudgetSetupScreenResult>,
): UseBudgetSetupScreenResult => ({
  currentStep: 0,
  setCurrentStep: jest.fn(),
  goToNextStep: jest.fn(),
  goToPreviousStep: jest.fn(),
  canProceedToNextStep: false,
  isLastStep: false,
  canNavigateToStep: jest.fn(() => true),
  planName: '',
  setPlanName: jest.fn(),
  existingBudget: null,
  isReady: true,
  loadError: null,
  isSaving: false,
  canContinueFromFoundation: false,
  isDarkMode: true,
  headerProps: {} as UseBudgetSetupScreenResult['headerProps'],
  onScroll: jest.fn(),
  formatCurrency: (amount) => `₹${amount}`,
  categories: [],
  fields: {monthlyIncome: '', plannedExpenses: '', plannedSavings: ''},
  selectedPeriod: 'monthly',
  setSelectedPeriod: jest.fn(),
  customSplits: [],
  splitDraft: {name: '', amount: ''},
  categoryAllocations: [],
  setCategoryAllocations: jest.fn(),
  enableCategoryBudgets: false,
  setEnableCategoryBudgets: jest.fn(),
  incomeSources: [],
  trackIncomeSources: false,
  setTrackIncomeSources: jest.fn(),
  showAddIncomeSource: false,
  setShowAddIncomeSource: jest.fn(),
  incomeDraft: {name: '', amount: '', type: 'salary'},
  linkedRecurringItems: [],
  autoPopulateFromRecurring: false,
  setAutoPopulateFromRecurring: jest.fn(),
  savingsGoals: [],
  savingsGoalAllocations: [],
  updateSavingsGoalAllocation: jest.fn(),
  totals: {
    remainingAmount: 0,
    totalAllocations: 0,
    incomeAmount: 0,
    expensesAmount: 0,
    savingsAmount: 0,
    committedLoanAmount: 0,
    committedSubscriptionAmount: 0,
    committedRecurringAmount: 0,
    totalCommittedAmount: 0,
  },
  currencySymbol: '₹',
  handleMonthlyIncomeChange: jest.fn(),
  handlePlannedExpensesChange: jest.fn(),
  handlePlannedSavingsChange: jest.fn(),
  setNewSplitName: jest.fn(),
  handleNewSplitAmountChange: jest.fn(),
  addCustomSplit: jest.fn(),
  removeSplit: jest.fn(),
  setNewIncomeSourceName: jest.fn(),
  setNewIncomeSourceAmount: jest.fn(),
  setNewIncomeSourceType: jest.fn(),
  addIncomeSource: jest.fn(),
  cancelIncomeSourceDraft: jest.fn(),
  updateIncomeSource: jest.fn(),
  removeIncomeSource: jest.fn(),
  saveBudget: jest.fn(() => Promise.resolve()),
  handleBack: jest.fn(),
  ...overrides,
});

describe('BudgetSetupSections', () => {
  it('renders foundation and inflow cards on step 0', () => {
    const {getByText, queryByText} = render(
      <BudgetSetupSections screen={createScreen({currentStep: 0})} />,
    );

    expect(getByText('Plan Information')).toBeTruthy();
    expect(getByText('Income Breakdown')).toBeTruthy();
    expect(getByText('Fixed Commitments')).toBeTruthy();

    expect(queryByText('Allocations & Spending')).toBeNull();
    expect(queryByText('Category-Based Budgeting')).toBeNull();
    expect(queryByText('Plan Summary')).toBeNull();
  });

  it('renders allocation cards on step 1', () => {
    const {getByText, queryByText} = render(
      <BudgetSetupSections screen={createScreen({currentStep: 1})} />,
    );

    expect(getByText('Allocations & Spending')).toBeTruthy();
    expect(getByText('Other Custom Splits')).toBeTruthy();

    expect(queryByText('Plan Information')).toBeNull();
    expect(queryByText('Fixed Commitments')).toBeNull();
    expect(queryByText('Category-Based Budgeting')).toBeNull();
  });

  it('renders category and summary cards on step 2', () => {
    const {getByText, queryByText} = render(
      <BudgetSetupSections screen={createScreen({currentStep: 2})} />,
    );

    expect(getByText('Category-Based Budgeting')).toBeTruthy();
    expect(getByText('Plan Summary')).toBeTruthy();

    expect(queryByText('Plan Information')).toBeNull();
    expect(queryByText('Allocations & Spending')).toBeNull();
  });
});
