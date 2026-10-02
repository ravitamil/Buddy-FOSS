export interface BudgetTrackingData {
  currentSpent: number;
  currentIncome: number;
  expenseUtilization: number;
  incomeAchievement: number;
  remainingBudget: number;
  remainingIncome: number;
  dailyAverageSpend: number;
  projectedMonthlySpend: number;
  daysInPeriod: number;
  daysElapsed: number;
  daysRemaining: number;
  hasExceededBudget: boolean;
  totalGroupExpenses: number;
  userShareOfGroupExpenses: number;
  pendingReimbursements: number;
  settlementIncomeReceived: number;
  personalExpenses: number;
}
