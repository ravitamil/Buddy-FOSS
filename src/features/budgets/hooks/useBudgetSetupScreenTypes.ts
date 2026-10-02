import type {useCategory} from '@/context';
import type {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import type {
  Budget,
  BudgetPeriod,
  BudgetSplit,
  CategoryBudgetAllocation,
  IncomeSource,
  RecurringBudgetItem,
  SavingsGoal,
} from '@/types';

export interface BudgetFieldViewModel {
  monthlyIncome: string;
  plannedExpenses: string;
  plannedSavings: string;
}

export type BudgetSetupStep = 0 | 1 | 2;

export interface BudgetSplitDraftViewModel {
  name: string;
  amount: string;
}

export interface IncomeSourceDraftViewModel {
  name: string;
  amount: string;
  type: IncomeSource['type'];
}

export interface BudgetSetupTotalsViewModel {
  remainingAmount: number;
  totalAllocations: number;
  incomeAmount: number;
  expensesAmount: number;
  savingsAmount: number;
  committedLoanAmount: number;
  committedSubscriptionAmount: number;
  committedRecurringAmount: number;
  totalCommittedAmount: number;
}

export interface UseBudgetSetupScreenResult {
  currentStep: BudgetSetupStep;
  setCurrentStep: (step: BudgetSetupStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceedToNextStep: boolean;
  isLastStep: boolean;
  canNavigateToStep: (step: BudgetSetupStep) => boolean;
  planName: string;
  setPlanName: (name: string) => void;
  existingBudget: Budget | null;
  isReady: boolean;
  loadError: string | null;
  isSaving: boolean;
  canContinueFromFoundation: boolean;
  isDarkMode: boolean;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  formatCurrency: (amount: number) => string;
  categories: ReturnType<typeof useCategory>['categories'];
  fields: BudgetFieldViewModel;
  selectedPeriod: BudgetPeriod;
  setSelectedPeriod: (period: BudgetPeriod) => void;
  customSplits: BudgetSplit[];
  splitDraft: BudgetSplitDraftViewModel;
  categoryAllocations: CategoryBudgetAllocation[];
  setCategoryAllocations: (allocations: CategoryBudgetAllocation[]) => void;
  enableCategoryBudgets: boolean;
  setEnableCategoryBudgets: (enabled: boolean) => void;
  incomeSources: IncomeSource[];
  trackIncomeSources: boolean;
  setTrackIncomeSources: (enabled: boolean) => void;
  showAddIncomeSource: boolean;
  setShowAddIncomeSource: (visible: boolean) => void;
  incomeDraft: IncomeSourceDraftViewModel;
  linkedRecurringItems: RecurringBudgetItem[];
  autoPopulateFromRecurring: boolean;
  setAutoPopulateFromRecurring: (enabled: boolean) => void;
  savingsGoals: SavingsGoal[];
  savingsGoalAllocations: NonNullable<Budget['savingsGoalsAllocation']>;
  updateSavingsGoalAllocation: (goalId: string, amount: string) => void;
  totals: BudgetSetupTotalsViewModel;
  currencySymbol: string;
  handleMonthlyIncomeChange: (text: string) => void;
  handlePlannedExpensesChange: (text: string) => void;
  handlePlannedSavingsChange: (text: string) => void;
  setNewSplitName: (name: string) => void;
  handleNewSplitAmountChange: (text: string) => void;
  addCustomSplit: (override?: {name?: string; amount?: string}) => void;
  removeSplit: (id: string) => void;
  setNewIncomeSourceName: (name: string) => void;
  setNewIncomeSourceAmount: (amount: string) => void;
  setNewIncomeSourceType: (type: IncomeSource['type']) => void;
  addIncomeSource: (override?: {
    name?: string;
    amount?: string;
    type?: IncomeSource['type'];
  }) => void;
  cancelIncomeSourceDraft: () => void;
  updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
  removeIncomeSource: (id: string) => void;
  saveBudget: () => Promise<void>;
  handleBack: () => void;
}
