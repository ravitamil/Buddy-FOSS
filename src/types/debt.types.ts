// Debt payoff strategy types
export type DebtPayoffStrategy = 'snowball' | 'avalanche' | 'snowflake' | 'custom';

export interface DebtPayoffPlan {
  strategy: DebtPayoffStrategy;
  loans: DebtPayoffLoan[];
  totalInterestSavings: number;
  yearsToPayoff: number;
  payoffSchedule: DebtPayoffScheduleEntry[];
  syncStatus?: 'pending' | 'synced' | 'conflict' | 'error';
}

export interface DebtPayoffLoan {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  extraPayment: number;
  payoffOrder: number;
  projectedPayoffDate: string;
  interestSavings: number;
}

export interface DebtPayoffScheduleEntry {
  month: number;
  date: string;
  loanId: string;
  loanName: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  isPaidOff: boolean;
}

export interface PaymentSchedule {
  totalMonths: number;
  totalInterestPaid: number;
  totalPayments: number;
  schedule: MonthlyPaymentEntry[];
}

export interface MonthlyPaymentEntry {
  month: number;
  date: string;
  loans: LoanPaymentDetail[];
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
}

export interface LoanPaymentDetail {
  loanId: string;
  loanName: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  isPaidOff: boolean;
}
