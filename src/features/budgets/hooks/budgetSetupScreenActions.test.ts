import type {Budget} from '@/types';

import {
  canNavigateToBudgetStep,
  createBudgetSetupDraftActions,
  createBudgetSetupInitialState,
  isBudgetFoundationComplete,
  resolveIncomeSourceDraft,
  resolveSplitDraft,
  validateBudgetSave,
} from './budgetSetupScreenActions';

describe('budgetSetupScreenActions', () => {
  it('creates defaults when no budget exists', () => {
    expect(createBudgetSetupInitialState(null)).toEqual({
      planName: '',
      monthlyIncome: '',
      plannedExpenses: '',
      plannedSavings: '',
      customSplits: [],
      selectedPeriod: 'monthly',
      categoryAllocations: [],
      enableCategoryBudgets: false,
      incomeSources: [],
      trackIncomeSources: false,
      linkedRecurringItems: [],
      autoPopulateFromRecurring: true,
      savingsGoalAllocations: [],
    });
  });

  it('creates initial state from an existing budget', () => {
    const budget = {
      name: 'Household plan',
      monthlyIncome: 5000,
      plannedExpenses: 2500,
      plannedSavings: 1000,
      customSplits: [{id: 'split-1', name: 'Fun', amount: 250, percentage: 5}],
      period: 'weekly',
      categoryAllocations: [{categoryId: 'food', allocatedAmount: 600}],
      incomeSources: [
        {
          id: 'income-1',
          name: 'Salary',
          amount: 5000,
          type: 'salary',
          frequency: 'monthly',
          isRecurring: true,
        },
      ],
      trackIncomeSources: true,
      linkedRecurringItems: [
        {
          templateId: 'recurring-1',
          description: 'Rent',
          amount: 1200,
          type: 'expense',
          isAutoPopulated: true,
        },
      ],
      autoPopulateFromRecurring: false,
    } as Budget;

    expect(createBudgetSetupInitialState(budget)).toMatchObject({
      planName: 'Household plan',
      monthlyIncome: '5000',
      plannedExpenses: '2500',
      plannedSavings: '1000',
      customSplits: budget.customSplits,
      selectedPeriod: 'weekly',
      categoryAllocations: budget.categoryAllocations,
      enableCategoryBudgets: true,
      incomeSources: budget.incomeSources,
      trackIncomeSources: true,
      linkedRecurringItems: budget.linkedRecurringItems,
      autoPopulateFromRecurring: false,
    });
  });

  it('resolves split drafts into errors or a new split', () => {
    expect(
      resolveSplitDraft({
        name: ' ',
        amountText: '',
        monthlyIncome: '1000',
        splitCount: 0,
      }),
    ).toEqual({
      error: 'Please enter both name and amount for the custom split',
    });

    expect(
      resolveSplitDraft({
        name: 'Fun',
        amountText: '0',
        monthlyIncome: '1000',
        splitCount: 0,
      }),
    ).toEqual({error: 'Please enter a valid amount'});

    const result = resolveSplitDraft({
      name: ' Fun ',
      amountText: '125',
      monthlyIncome: '1000',
      splitCount: 0,
    });

    expect('value' in result).toBe(true);
    if ('value' in result) {
      expect(result.value).toMatchObject({
        name: 'Fun',
        amount: 125,
        percentage: 12.5,
      });
    }
  });

  it('resolves income source drafts into errors or a new source', () => {
    expect(
      resolveIncomeSourceDraft({
        name: '',
        amountText: '',
        type: 'salary',
        sourceCount: 0,
      }),
    ).toEqual({
      error: 'Please enter both name and amount for the income source',
    });

    expect(
      resolveIncomeSourceDraft({
        name: 'Salary',
        amountText: '-1',
        type: 'salary',
        sourceCount: 0,
      }),
    ).toEqual({error: 'Please enter a valid amount'});

    const result = resolveIncomeSourceDraft({
      name: ' Salary ',
      amountText: '5000',
      type: 'salary',
      sourceCount: 0,
    });

    expect('value' in result).toBe(true);
    if ('value' in result) {
      expect(result.value).toMatchObject({
        name: 'Salary',
        amount: 5000,
        type: 'salary',
      });
    }
  });

  it('validates income and allocation limits before saving', () => {
    expect(validateBudgetSave({planName: 'Plan', monthlyIncome: '', remainingAmount: 0})).toBe(
      'Please enter a valid monthly income',
    );
    expect(validateBudgetSave({planName: 'Plan', monthlyIncome: '1000', remainingAmount: -1})).toBe(
      'Total planned expenses, savings, and custom splits exceed your income',
    );
    expect(validateBudgetSave({planName: '', monthlyIncome: '1000', remainingAmount: 0})).toBe(
      'Please enter a name for this budget plan',
    );
    expect(
      validateBudgetSave({planName: 'Plan', monthlyIncome: '1000', remainingAmount: 0}),
    ).toBeNull();
  });

  it('requires both a plan name and positive income before leaving the foundation step', () => {
    expect(isBudgetFoundationComplete({planName: '', monthlyIncome: ''})).toBe(false);
    expect(isBudgetFoundationComplete({planName: 'Household', monthlyIncome: '0'})).toBe(false);
    expect(isBudgetFoundationComplete({planName: '  ', monthlyIncome: '5000'})).toBe(false);
    expect(isBudgetFoundationComplete({planName: 'Household', monthlyIncome: '5000'})).toBe(true);
  });

  it('controls step navigation based on foundation and allocation limits', () => {
    // Current or previous step is always allowed
    expect(
      canNavigateToBudgetStep(0, 1, {
        canContinueFromFoundation: false,
        remainingAmount: -10,
        hasExistingBudget: false,
      }),
    ).toBe(true);
    expect(
      canNavigateToBudgetStep(1, 1, {
        canContinueFromFoundation: false,
        remainingAmount: -10,
        hasExistingBudget: false,
      }),
    ).toBe(true);

    // Step 1 requires foundation
    expect(
      canNavigateToBudgetStep(1, 0, {
        canContinueFromFoundation: false,
        remainingAmount: 100,
        hasExistingBudget: false,
      }),
    ).toBe(false);
    expect(
      canNavigateToBudgetStep(1, 0, {
        canContinueFromFoundation: true,
        remainingAmount: 100,
        hasExistingBudget: false,
      }),
    ).toBe(true);

    // Step 2 requires foundation and non-negative remaining amount for new plans
    expect(
      canNavigateToBudgetStep(2, 0, {
        canContinueFromFoundation: false,
        remainingAmount: 100,
        hasExistingBudget: false,
      }),
    ).toBe(false);
    expect(
      canNavigateToBudgetStep(2, 1, {
        canContinueFromFoundation: true,
        remainingAmount: -50,
        hasExistingBudget: false,
      }),
    ).toBe(false);
    expect(
      canNavigateToBudgetStep(2, 1, {
        canContinueFromFoundation: true,
        remainingAmount: 0,
        hasExistingBudget: false,
      }),
    ).toBe(true);
    expect(
      canNavigateToBudgetStep(2, 1, {
        canContinueFromFoundation: true,
        remainingAmount: -50,
        hasExistingBudget: true,
      }),
    ).toBe(true);
  });

  it('creates draft actions that validate, append, and clear form state', () => {
    const setCustomSplits = jest.fn();
    const setNewSplitName = jest.fn();
    const setNewSplitAmount = jest.fn();
    const showError = jest.fn();
    const actions = createBudgetSetupDraftActions({
      monthlyIncome: '1000',
      customSplits: [],
      splitDraft: {name: 'Fun', amount: '100'},
      incomeSources: [],
      incomeDraft: {name: '', amount: '', type: 'salary'},
      setMonthlyIncome: jest.fn(),
      setPlannedExpenses: jest.fn(),
      setPlannedSavings: jest.fn(),
      setCustomSplits,
      setNewSplitName,
      setNewSplitAmount,
      setIncomeSources: jest.fn(),
      setNewIncomeSourceName: jest.fn(),
      setNewIncomeSourceAmount: jest.fn(),
      setShowAddIncomeSource: jest.fn(),
      showError,
    });

    actions.addCustomSplit();
    actions.addIncomeSource();

    expect(setCustomSplits).toHaveBeenCalledTimes(1);
    expect(setNewSplitName).toHaveBeenCalledWith('');
    expect(setNewSplitAmount).toHaveBeenCalledWith('');
    expect(showError).toHaveBeenCalledWith(
      'Please enter both name and amount for the income source',
    );
  });

  it('supports adding an income source with direct override values', () => {
    const setIncomeSources = jest.fn();
    const setNewIncomeSourceName = jest.fn();
    const setNewIncomeSourceAmount = jest.fn();
    const setShowAddIncomeSource = jest.fn();
    const showError = jest.fn();

    const actions = createBudgetSetupDraftActions({
      monthlyIncome: '5000',
      customSplits: [],
      splitDraft: {name: '', amount: ''},
      incomeSources: [],
      incomeDraft: {name: '', amount: '', type: 'salary'},
      setMonthlyIncome: jest.fn(),
      setPlannedExpenses: jest.fn(),
      setPlannedSavings: jest.fn(),
      setCustomSplits: jest.fn(),
      setNewSplitName: jest.fn(),
      setNewSplitAmount: jest.fn(),
      setIncomeSources,
      setNewIncomeSourceName,
      setNewIncomeSourceAmount,
      setShowAddIncomeSource,
      showError,
    });

    actions.addIncomeSource({
      name: 'Consulting',
      amount: '3500',
      type: 'freelance',
    });

    expect(showError).not.toHaveBeenCalled();
    expect(setIncomeSources).toHaveBeenCalledTimes(1);
    expect(setNewIncomeSourceName).toHaveBeenCalledWith('');
    expect(setNewIncomeSourceAmount).toHaveBeenCalledWith('');
    expect(setShowAddIncomeSource).toHaveBeenCalledWith(false);
  });

  it('supports adding a custom split with direct override values', () => {
    const setCustomSplits = jest.fn();
    const setNewSplitName = jest.fn();
    const setNewSplitAmount = jest.fn();
    const showError = jest.fn();

    const actions = createBudgetSetupDraftActions({
      monthlyIncome: '5000',
      customSplits: [],
      splitDraft: {name: '', amount: ''},
      incomeSources: [],
      incomeDraft: {name: '', amount: '', type: 'salary'},
      setMonthlyIncome: jest.fn(),
      setPlannedExpenses: jest.fn(),
      setPlannedSavings: jest.fn(),
      setCustomSplits,
      setNewSplitName,
      setNewSplitAmount,
      setIncomeSources: jest.fn(),
      setNewIncomeSourceName: jest.fn(),
      setNewIncomeSourceAmount: jest.fn(),
      setShowAddIncomeSource: jest.fn(),
      showError,
    });

    actions.addCustomSplit({
      name: 'Travel Fund',
      amount: '500',
    });

    expect(showError).not.toHaveBeenCalled();
    expect(setCustomSplits).toHaveBeenCalledTimes(1);
    expect(setNewSplitName).toHaveBeenCalledWith('');
    expect(setNewSplitAmount).toHaveBeenCalledWith('');
  });
});
