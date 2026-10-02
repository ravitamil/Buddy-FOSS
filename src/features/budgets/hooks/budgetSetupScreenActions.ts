import type {Budget, BudgetSplit, IncomeSource} from '@/types';

import type {BudgetSetupStep} from './useBudgetSetupScreenTypes';
import {createBudgetSplit, createIncomeSource, isValidNumericInput} from './budgetSetupScreenUtils';

interface BudgetSetupInitialState {
  planName: string;
  monthlyIncome: string;
  plannedExpenses: string;
  plannedSavings: string;
  customSplits: BudgetSplit[];
  selectedPeriod: Budget['period'];
  categoryAllocations: NonNullable<Budget['categoryAllocations']>;
  enableCategoryBudgets: boolean;
  incomeSources: IncomeSource[];
  trackIncomeSources: boolean;
  linkedRecurringItems: NonNullable<Budget['linkedRecurringItems']>;
  autoPopulateFromRecurring: boolean;
  savingsGoalAllocations: NonNullable<Budget['savingsGoalsAllocation']>;
}

type DraftResolution<T> = {value: T} | {error: string};
type StateSetter<T> = (value: T | ((previous: T) => T)) => void;

interface BudgetSetupDraftActionParams {
  monthlyIncome: string;
  customSplits: BudgetSplit[];
  splitDraft: {name: string; amount: string};
  incomeSources: IncomeSource[];
  incomeDraft: {name: string; amount: string; type: IncomeSource['type']};
  setMonthlyIncome: StateSetter<string>;
  setPlannedExpenses: StateSetter<string>;
  setPlannedSavings: StateSetter<string>;
  setCustomSplits: StateSetter<BudgetSplit[]>;
  setNewSplitName: StateSetter<string>;
  setNewSplitAmount: StateSetter<string>;
  setIncomeSources: StateSetter<IncomeSource[]>;
  setNewIncomeSourceName: StateSetter<string>;
  setNewIncomeSourceAmount: StateSetter<string>;
  setShowAddIncomeSource: StateSetter<boolean>;
  showError: (message: string) => void;
}

export function createBudgetSetupInitialState(budget: Budget | null): BudgetSetupInitialState {
  return {
    planName: budget?.name ?? '',
    monthlyIncome: budget ? String(budget.monthlyIncome) : '',
    plannedExpenses: budget ? String(budget.plannedExpenses) : '',
    plannedSavings: budget ? String(budget.plannedSavings) : '',
    customSplits: budget?.customSplits ?? [],
    selectedPeriod: budget?.period ?? 'monthly',
    categoryAllocations: budget?.categoryAllocations ?? [],
    enableCategoryBudgets: Boolean(budget?.categoryAllocations?.length),
    incomeSources: budget?.incomeSources ?? [],
    trackIncomeSources: Boolean(budget?.trackIncomeSources),
    linkedRecurringItems: budget?.linkedRecurringItems ?? [],
    autoPopulateFromRecurring: budget?.autoPopulateFromRecurring ?? true,
    savingsGoalAllocations: budget?.savingsGoalsAllocation ?? [],
  };
}

export function resolveSplitDraft(params: {
  name: string;
  amountText: string;
  monthlyIncome: string;
  splitCount: number;
}): DraftResolution<BudgetSplit> {
  const error = validateDraft(params.name, params.amountText, 'custom split');
  if (error) return {error};

  return {value: createBudgetSplit(params)};
}

export function resolveIncomeSourceDraft(params: {
  name: string;
  amountText: string;
  type: IncomeSource['type'];
  sourceCount: number;
}): DraftResolution<IncomeSource> {
  const error = validateDraft(params.name, params.amountText, 'income source');
  if (error) return {error};

  return {value: createIncomeSource(params)};
}

export function validateBudgetSave(params: {
  planName: string;
  monthlyIncome: string;
  remainingAmount: number;
}): string | null {
  if (!params.planName.trim()) return 'Please enter a name for this budget plan';

  const income = Number.parseFloat(params.monthlyIncome);
  if (!income || income <= 0) return 'Please enter a valid monthly income';

  if (params.remainingAmount < 0) {
    return 'Total planned expenses, savings, and custom splits exceed your income';
  }

  return null;
}

export function isBudgetFoundationComplete(params: {
  planName: string;
  monthlyIncome: string;
}): boolean {
  const income = Number.parseFloat(params.monthlyIncome);
  return params.planName.trim().length > 0 && Number.isFinite(income) && income > 0;
}

export function canNavigateToBudgetStep(
  targetStep: BudgetSetupStep,
  currentStep: BudgetSetupStep,
  params: {
    canContinueFromFoundation: boolean;
    remainingAmount: number;
    hasExistingBudget: boolean;
  },
): boolean {
  if (targetStep === currentStep) return true;
  if (targetStep < currentStep) return true;
  if (targetStep === 1) return params.canContinueFromFoundation;
  if (targetStep === 2) {
    return (
      params.canContinueFromFoundation && (params.hasExistingBudget || params.remainingAmount >= 0)
    );
  }
  return false;
}

export function createBudgetSetupDraftActions(params: BudgetSetupDraftActionParams) {
  const setNumericValue = (value: string, setter: StateSetter<string>) => {
    if (isValidNumericInput(value)) setter(value);
  };

  return {
    handleMonthlyIncomeChange: (value: string) => setNumericValue(value, params.setMonthlyIncome),
    handlePlannedExpensesChange: (value: string) =>
      setNumericValue(value, params.setPlannedExpenses),
    handlePlannedSavingsChange: (value: string) => setNumericValue(value, params.setPlannedSavings),
    handleNewSplitAmountChange: (value: string) => setNumericValue(value, params.setNewSplitAmount),
    setNewIncomeSourceAmount: (value: string) =>
      setNumericValue(value, params.setNewIncomeSourceAmount),
    addCustomSplit: (override?: {name?: string; amount?: string}) => {
      const name = override?.name ?? params.splitDraft.name;
      const amountText = override?.amount ?? params.splitDraft.amount;
      const result = resolveSplitDraft({
        name,
        amountText,
        monthlyIncome: params.monthlyIncome,
        splitCount: params.customSplits.length,
      });
      if ('error' in result) {
        params.showError(result.error);
        return;
      }

      params.setCustomSplits((previous) => [...previous, result.value]);
      params.setNewSplitName('');
      params.setNewSplitAmount('');
    },
    removeSplit: (id: string) => {
      params.setCustomSplits((previous) => previous.filter((split) => split.id !== id));
    },
    addIncomeSource: (override?: {name?: string; amount?: string; type?: IncomeSource['type']}) => {
      const name = override?.name ?? params.incomeDraft.name;
      const amountText = override?.amount ?? params.incomeDraft.amount;
      const type = override?.type ?? params.incomeDraft.type;

      const result = resolveIncomeSourceDraft({
        name,
        amountText,
        type,
        sourceCount: params.incomeSources.length,
      });
      if ('error' in result) {
        params.showError(result.error);
        return;
      }

      params.setIncomeSources((previous) => [...previous, result.value]);
      params.setNewIncomeSourceName('');
      params.setNewIncomeSourceAmount('');
      params.setShowAddIncomeSource(false);
    },
    cancelIncomeSourceDraft: () => {
      params.setShowAddIncomeSource(false);
      params.setNewIncomeSourceName('');
      params.setNewIncomeSourceAmount('');
    },
    updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => {
      params.setIncomeSources((previous) =>
        previous.map((source) => (source.id === id ? {...source, ...updates} : source)),
      );
    },
    removeIncomeSource: (id: string) => {
      params.setIncomeSources((previous) => previous.filter((source) => source.id !== id));
    },
  };
}

function validateDraft(name: string, amountText: string, itemLabel: string): string | null {
  if (!name.trim() || !amountText.trim()) {
    return `Please enter both name and amount for the ${itemLabel}`;
  }

  const amount = Number.parseFloat(amountText);
  if (Number.isNaN(amount) || amount <= 0) return 'Please enter a valid amount';

  return null;
}
