import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {router} from 'expo-router';

import {useCategory, useLoan, useSettings, useSubscription} from '@/context';
import {useSavingsState} from '@/features/savings';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import {RecurringTransactionService} from '@/services/RecurringTransactionService';
import type {
  Budget,
  BudgetPeriod,
  BudgetSplit,
  CategoryBudgetAllocation,
  IncomeSource,
  RecurringBudgetItem,
} from '@/types';

import {
  calculateBudgetSetupTotals,
  createBudgetPayload,
  getRecurringExpensesTotal,
  toRecurringBudgetItems,
} from './budgetSetupScreenUtils';
import {useBudgetState} from './useBudgetState';
import {
  canNavigateToBudgetStep,
  createBudgetSetupDraftActions,
  createBudgetSetupInitialState,
  isBudgetFoundationComplete,
  validateBudgetSave,
} from './budgetSetupScreenActions';
import type {BudgetSetupStep, UseBudgetSetupScreenResult} from './useBudgetSetupScreenTypes';
import {budgetRoutes} from '../routes';

export type {BudgetSetupStep, UseBudgetSetupScreenResult} from './useBudgetSetupScreenTypes';

const logger = appLogger.contextLogger('BudgetSetupScreen');

export interface BudgetSetupRouteIntent {
  budgetId?: string | null;
  mode?: string | null;
}

export function useBudgetSetupScreen({
  budgetId,
  mode,
}: BudgetSetupRouteIntent): UseBudgetSetupScreenResult {
  const {getBudgetById, isLoading, setActiveBudget, addBudget, updateBudget} = useBudgetState();
  const {currency, formatCurrency} = useSettings();
  const {categories} = useCategory();
  const {getTotalMonthlyEMI} = useLoan();
  const {getMonthlyCost} = useSubscription();
  const {savingsGoals} = useSavingsState();
  const {isDarkMode} = useTamaguiTheme();
  const {showAlert} = useAlert();
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});

  const requestedBudgetId = budgetId?.length ? budgetId : null;
  const isCreateIntent = mode === 'create' || requestedBudgetId === null;
  const existingBudget = requestedBudgetId ? (getBudgetById(requestedBudgetId) ?? null) : null;
  const loadError =
    !isLoading && requestedBudgetId && !existingBudget
      ? 'This budget plan is no longer available.'
      : null;
  const initialStateRef = useRef(createBudgetSetupInitialState(null));
  const initializedBudgetKey = useRef<string | null>(null);
  const [currentStep, setCurrentStepState] = useState<BudgetSetupStep>(0);
  const [planName, setPlanName] = useState(initialStateRef.current.planName);
  const [monthlyIncome, setMonthlyIncome] = useState(initialStateRef.current.monthlyIncome);
  const [plannedExpenses, setPlannedExpenses] = useState(initialStateRef.current.plannedExpenses);
  const [plannedSavings, setPlannedSavings] = useState(initialStateRef.current.plannedSavings);
  const [customSplits, setCustomSplits] = useState<BudgetSplit[]>(
    initialStateRef.current.customSplits,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(
    initialStateRef.current.selectedPeriod,
  );
  const [categoryAllocations, setCategoryAllocations] = useState<CategoryBudgetAllocation[]>(
    initialStateRef.current.categoryAllocations,
  );
  const [enableCategoryBudgets, setEnableCategoryBudgets] = useState(
    initialStateRef.current.enableCategoryBudgets,
  );
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(
    initialStateRef.current.incomeSources,
  );
  const [trackIncomeSources, setTrackIncomeSources] = useState(
    initialStateRef.current.trackIncomeSources,
  );
  const [showAddIncomeSource, setShowAddIncomeSource] = useState(false);
  const [newIncomeSourceName, setNewIncomeSourceName] = useState('');
  const [newIncomeSourceAmount, setNewIncomeSourceAmountState] = useState('');
  const [newIncomeSourceType, setNewIncomeSourceType] = useState<IncomeSource['type']>('salary');
  const [linkedRecurringItems, setLinkedRecurringItems] = useState<RecurringBudgetItem[]>(
    initialStateRef.current.linkedRecurringItems,
  );
  const [autoPopulateFromRecurring, setAutoPopulateFromRecurring] = useState(
    initialStateRef.current.autoPopulateFromRecurring,
  );
  const [savingsGoalAllocations, setSavingsGoalAllocations] = useState<
    NonNullable<Budget['savingsGoalsAllocation']>
  >(initialStateRef.current.savingsGoalAllocations);
  const [newSplitName, setNewSplitName] = useState('');
  const [newSplitAmount, setNewSplitAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isLoading || loadError) return;

    const draftBudget = isCreateIntent ? null : existingBudget;
    const draftKey = draftBudget?.id ?? 'new';
    if (initializedBudgetKey.current === draftKey) return;

    const nextState = createBudgetSetupInitialState(draftBudget);
    initializedBudgetKey.current = draftKey;
    setPlanName(nextState.planName);
    setMonthlyIncome(nextState.monthlyIncome);
    setPlannedExpenses(nextState.plannedExpenses);
    setPlannedSavings(nextState.plannedSavings);
    setCustomSplits(nextState.customSplits);
    setSelectedPeriod(nextState.selectedPeriod);
    setCategoryAllocations(nextState.categoryAllocations);
    setEnableCategoryBudgets(nextState.enableCategoryBudgets);
    setIncomeSources(nextState.incomeSources);
    setTrackIncomeSources(nextState.trackIncomeSources);
    setLinkedRecurringItems(nextState.linkedRecurringItems);
    setAutoPopulateFromRecurring(nextState.autoPopulateFromRecurring);
    setSavingsGoalAllocations(nextState.savingsGoalAllocations);
  }, [existingBudget, isCreateIntent, isLoading, loadError]);

  useEffect(() => {
    const loadRecurringTransactions = async () => {
      if (!autoPopulateFromRecurring) return;

      try {
        const templates =
          await RecurringTransactionService.getInstance().getActiveRecurringTemplates();
        const budgetItems = toRecurringBudgetItems(templates);

        setLinkedRecurringItems(budgetItems);
      } catch (error) {
        logger.error('Error loading recurring transactions:', error);
      }
    };

    void loadRecurringTransactions();
  }, [autoPopulateFromRecurring]);

  useEffect(() => {
    if (trackIncomeSources && incomeSources.length > 0) {
      const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0);
      setMonthlyIncome(String(totalIncome));
    }
  }, [incomeSources, trackIncomeSources]);

  const draftActions = createBudgetSetupDraftActions({
    monthlyIncome,
    customSplits,
    splitDraft: {name: newSplitName, amount: newSplitAmount},
    incomeSources,
    incomeDraft: {
      name: newIncomeSourceName,
      amount: newIncomeSourceAmount,
      type: newIncomeSourceType,
    },
    setMonthlyIncome,
    setPlannedExpenses,
    setPlannedSavings,
    setCustomSplits,
    setNewSplitName,
    setNewSplitAmount,
    setIncomeSources,
    setNewIncomeSourceName,
    setNewIncomeSourceAmount: setNewIncomeSourceAmountState,
    setShowAddIncomeSource,
    showError: (message) => showAlert({title: 'Error', message}),
  });

  const totals = useMemo(() => {
    return calculateBudgetSetupTotals({
      monthlyIncome,
      plannedExpenses,
      plannedSavings,
      customSplits,
      committedLoanAmount: getTotalMonthlyEMI(),
      committedSubscriptionAmount: getMonthlyCost(),
      committedRecurringAmount: autoPopulateFromRecurring
        ? getRecurringExpensesTotal(linkedRecurringItems)
        : 0,
    });
  }, [
    autoPopulateFromRecurring,
    customSplits,
    getMonthlyCost,
    getTotalMonthlyEMI,
    linkedRecurringItems,
    monthlyIncome,
    plannedExpenses,
    plannedSavings,
  ]);

  const updateSavingsGoalAllocation = useCallback(
    (goalId: string, amountText: string) => {
      if (!/^\d*(\.\d{0,2})?$/.test(amountText)) return;
      const amount = Number.parseFloat(amountText) || 0;
      const income = Number.parseFloat(monthlyIncome) || 0;

      setSavingsGoalAllocations((current) => {
        const withoutGoal = current.filter((allocation) => allocation.goalId !== goalId);
        if (amount <= 0) return withoutGoal;
        return [
          ...withoutGoal,
          {
            goalId,
            allocatedAmount: amount,
            percentageOfIncome: income > 0 ? (amount / income) * 100 : 0,
          },
        ];
      });
    },
    [monthlyIncome],
  );

  const saveBudget = useCallback(async () => {
    if (isSaving || loadError) return;

    const validationError = validateBudgetSave({
      planName,
      monthlyIncome,
      remainingAmount: totals.remainingAmount,
    });
    if (validationError) {
      showAlert({title: 'Error', message: validationError});
      return;
    }

    const savingsGoalsTotal = savingsGoalAllocations.reduce(
      (total, allocation) => total + allocation.allocatedAmount,
      0,
    );
    if (savingsGoalsTotal > totals.savingsAmount) {
      showAlert({
        title: 'Savings allocation too high',
        message: 'Goal allocations cannot exceed your planned savings amount.',
      });
      return;
    }

    const categoryTotal = categoryAllocations.reduce(
      (total, allocation) => total + allocation.amount,
      0,
    );
    if (enableCategoryBudgets && categoryTotal > totals.expensesAmount) {
      showAlert({
        title: 'Category allocation too high',
        message: 'Category allocations cannot exceed your flexible spending amount.',
      });
      return;
    }

    try {
      setIsSaving(true);
      const budgetData = createBudgetPayload({
        planName,
        monthlyIncome,
        currencyCode: currency,
        plannedExpenses,
        plannedSavings,
        customSplits,
        selectedPeriod,
        enableCategoryBudgets,
        categoryAllocations,
        trackIncomeSources,
        incomeSources,
        autoPopulateFromRecurring,
        linkedRecurringItems,
        savingsGoalAllocations,
      });

      let budgetId: string;
      if (existingBudget) {
        await updateBudget(existingBudget.id, budgetData);
        budgetId = existingBudget.id;
      } else {
        const newBudget = await addBudget(budgetData);
        budgetId = newBudget.id;
      }

      await setActiveBudget(budgetId);
      logger.debug('Budget saved successfully', {
        budgetId,
        isExisting: Boolean(existingBudget),
        budgetData,
      });

      router.replace(budgetRoutes.details(budgetId));
    } catch (error) {
      logger.error('Error saving budget:', error);
      showAlert({title: 'Error', message: 'Failed to save budget. Please try again.'});
    } finally {
      setIsSaving(false);
    }
  }, [
    addBudget,
    autoPopulateFromRecurring,
    categoryAllocations,
    customSplits,
    currency,
    enableCategoryBudgets,
    existingBudget,
    incomeSources,
    linkedRecurringItems,
    monthlyIncome,
    planName,
    plannedExpenses,
    plannedSavings,
    selectedPeriod,
    savingsGoalAllocations,
    setActiveBudget,
    showAlert,
    isSaving,
    loadError,
    totals.remainingAmount,
    totals.expensesAmount,
    totals.savingsAmount,
    trackIncomeSources,
    updateBudget,
  ]);

  const currencySymbol = useMemo(() => formatCurrency(0).replace(/[0-9.,]/g, ''), [formatCurrency]);

  const canContinueFromFoundation = useMemo(() => {
    return isBudgetFoundationComplete({planName, monthlyIncome});
  }, [monthlyIncome, planName]);

  const canProceedToNextStep = useMemo(() => {
    if (currentStep === 0) return canContinueFromFoundation;
    if (currentStep === 1) return totals.remainingAmount >= 0;
    return true;
  }, [canContinueFromFoundation, currentStep, totals.remainingAmount]);

  const isLastStep = currentStep === 2;

  const canNavigateToStep = useCallback(
    (targetStep: BudgetSetupStep) => {
      return canNavigateToBudgetStep(targetStep, currentStep, {
        canContinueFromFoundation,
        remainingAmount: totals.remainingAmount,
        hasExistingBudget: Boolean(existingBudget),
      });
    },
    [canContinueFromFoundation, currentStep, existingBudget, totals.remainingAmount],
  );

  const setCurrentStep = useCallback(
    (step: BudgetSetupStep) => {
      if (canNavigateToStep(step)) {
        setCurrentStepState(step);
      }
    },
    [canNavigateToStep],
  );

  const goToNextStep = useCallback(() => {
    if (currentStep === 0) {
      if (!canContinueFromFoundation) {
        showAlert({
          title: 'Plan Foundation Required',
          message: 'Please enter a plan name and planned income to continue.',
        });
        return;
      }
      setCurrentStepState(1);
    } else if (currentStep === 1) {
      if (totals.remainingAmount < 0) {
        showAlert({
          title: 'Overallocated',
          message: 'Total planned expenses, savings, and custom splits exceed your income.',
        });
        return;
      }
      setCurrentStepState(2);
    }
  }, [canContinueFromFoundation, currentStep, showAlert, totals.remainingAmount]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStepState((prev) => (prev - 1) as BudgetSetupStep);
    } else {
      router.back();
    }
  }, [currentStep]);

  return {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    canProceedToNextStep,
    isLastStep,
    canNavigateToStep,
    planName,
    setPlanName,
    existingBudget,
    isReady: !isLoading && !loadError && (isCreateIntent || existingBudget !== null),
    loadError,
    isSaving,
    canContinueFromFoundation,
    isDarkMode,
    headerProps,
    onScroll,
    formatCurrency,
    categories,
    fields: {monthlyIncome, plannedExpenses, plannedSavings},
    selectedPeriod,
    setSelectedPeriod,
    customSplits,
    splitDraft: {name: newSplitName, amount: newSplitAmount},
    categoryAllocations,
    setCategoryAllocations,
    enableCategoryBudgets,
    setEnableCategoryBudgets,
    incomeSources,
    trackIncomeSources,
    setTrackIncomeSources,
    showAddIncomeSource,
    setShowAddIncomeSource,
    incomeDraft: {
      name: newIncomeSourceName,
      amount: newIncomeSourceAmount,
      type: newIncomeSourceType,
    },
    linkedRecurringItems,
    autoPopulateFromRecurring,
    setAutoPopulateFromRecurring,
    savingsGoals,
    savingsGoalAllocations,
    updateSavingsGoalAllocation,
    totals,
    currencySymbol,
    handleMonthlyIncomeChange: draftActions.handleMonthlyIncomeChange,
    handlePlannedExpensesChange: draftActions.handlePlannedExpensesChange,
    handlePlannedSavingsChange: draftActions.handlePlannedSavingsChange,
    setNewSplitName,
    handleNewSplitAmountChange: draftActions.handleNewSplitAmountChange,
    addCustomSplit: draftActions.addCustomSplit,
    removeSplit: draftActions.removeSplit,
    setNewIncomeSourceName,
    setNewIncomeSourceAmount: draftActions.setNewIncomeSourceAmount,
    setNewIncomeSourceType,
    addIncomeSource: draftActions.addIncomeSource,
    cancelIncomeSourceDraft: draftActions.cancelIncomeSourceDraft,
    updateIncomeSource: draftActions.updateIncomeSource,
    removeIncomeSource: draftActions.removeIncomeSource,
    saveBudget,
    handleBack: goToPreviousStep,
  };
}
