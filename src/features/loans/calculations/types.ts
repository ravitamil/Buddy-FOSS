import type {AmortizationEntry} from '@/types/loan.types';

export type PaymentFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type EMICalculationMethod = 'REDUCING_BALANCE' | 'FLAT_RATE';
export type AmortizationScheduleEntry = AmortizationEntry;

export interface EMICalculationInput {
  principal: number;
  annualInterestRate: number;
  tenureInMonths: number;
  calculationMethod?: EMICalculationMethod;
  paymentFrequency?: PaymentFrequency;
}

export interface EMICalculationResult {
  emiAmount: number;
  totalAmount: number;
  totalInterest: number;
  amortizationSchedule: AmortizationEntry[];
}

export interface LoanDisplayMetrics {
  totalAmount: number;
  completedTenure: number;
  remainingTenure: number;
  maturityDate: string;
  remainingAmount: number;
  paidAmount: number;
  progressPercentage: number;
  isLoanCompleted: boolean;
}
