import type {LoanData, LoanInsights} from '@/types/loan.types';
import {calculateReducingBalanceEMI} from './emi';

export function calculatePrepaymentImpact(
  currentOutstanding: number,
  prepaymentAmount: number,
  currentEMI: number,
  annualInterestRate: number,
  remainingTenure: number,
  option: 'reduce_tenure' | 'reduce_emi' = 'reduce_tenure',
): {
  newOutstanding: number;
  newEMI?: number;
  newTenure?: number;
  interestSaved: number;
} {
  const newOutstanding = Math.max(0, currentOutstanding - prepaymentAmount);

  if (newOutstanding === 0) {
    return {newOutstanding: 0, newEMI: 0, newTenure: 0, interestSaved: 0};
  }

  if (option === 'reduce_emi') {
    const newEMI = calculateReducingBalanceEMI(newOutstanding, annualInterestRate, remainingTenure);
    return {
      newOutstanding,
      newEMI,
      interestSaved: parseFloat(
        (
          currentEMI * remainingTenure -
          currentOutstanding -
          (newEMI * remainingTenure - newOutstanding)
        ).toFixed(2),
      ),
    };
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  let newTenure = 0;
  let balance = newOutstanding;

  while (balance > 0 && newTenure < remainingTenure) {
    const interest = balance * monthlyRate;
    balance -= currentEMI - interest;
    newTenure++;
  }

  return {
    newOutstanding,
    newTenure,
    interestSaved: parseFloat(
      (
        currentEMI * remainingTenure -
        currentOutstanding -
        (currentEMI * newTenure - newOutstanding)
      ).toFixed(2),
    ),
  };
}

export function calculateTotalInterest(
  principal: number,
  emiAmount: number,
  annualInterestRate: number,
  tenure: number,
): number {
  void annualInterestRate;
  return parseFloat((emiAmount * tenure - principal).toFixed(2));
}

export function calculateEffectiveInterestRate(
  principal: number,
  emiAmount: number,
  tenure: number,
  processingFee = 0,
  otherCharges = 0,
): number {
  const totalPayment = emiAmount * tenure;
  const totalCost = totalPayment + processingFee + otherCharges;
  return parseFloat((((totalCost - principal) / principal) * (12 / tenure) * 100).toFixed(2));
}

export function calculateLoanToValueRatio(loanAmount: number, assetValue: number): number {
  return assetValue <= 0 ? 0 : parseFloat(((loanAmount / assetValue) * 100).toFixed(2));
}

export function calculateDebtToIncomeRatio(
  totalMonthlyEMIs: number,
  monthlyIncome: number,
): number {
  return monthlyIncome <= 0 ? 0 : parseFloat(((totalMonthlyEMIs / monthlyIncome) * 100).toFixed(2));
}

export function validateLoanParameters(params: {
  principal: number;
  interestRate: number;
  tenure?: number;
  emiAmount?: number;
}): {isValid: boolean; errors: string[]} {
  const errors: string[] = [];

  if (params.principal <= 0) errors.push('Principal amount must be greater than zero');
  if (params.interestRate < 0) errors.push('Interest rate cannot be negative');
  if (params.tenure !== undefined && params.tenure <= 0)
    errors.push('Tenure must be greater than zero');
  if (params.emiAmount !== undefined && params.emiAmount <= 0)
    errors.push('EMI amount must be greater than zero');

  const hasTenure = params.tenure !== undefined && params.tenure > 0;
  const hasEmiAmount = params.emiAmount !== undefined && params.emiAmount > 0;

  if (!hasTenure && !hasEmiAmount) {
    errors.push('Either tenure or EMI amount must be provided');
  } else if (hasTenure && hasEmiAmount) {
    errors.push('Provide either tenure or EMI amount, not both');
  }

  return {isValid: errors.length === 0, errors};
}

export function calculateLoanInsights(loan: LoanData): LoanInsights {
  const paidInstallments =
    loan.paymentHistory?.filter((payment) => payment.status === 'PAID').length || 0;
  const remainingTenure = Math.max(0, loan.tenure - paidInstallments);
  const totalInterestPaid =
    loan.paymentHistory
      ?.filter((payment) => payment.status === 'PAID')
      .reduce((sum, payment) => sum + payment.interestPaid, 0) || 0;
  const totalInterestRemaining = loan.totalInterest - totalInterestPaid;
  const upcomingEntry = loan.amortizationSchedule?.find((entry) => entry.status === 'UPCOMING');
  const lastEntry = loan.amortizationSchedule?.[loan.amortizationSchedule.length - 1];

  return {
    remainingTenure,
    totalInterestPaid,
    totalInterestRemaining,
    nextEmiDate: upcomingEntry?.paymentDate ?? loan.nextEmiDate,
    outstandingBalance: lastEntry?.outstandingBalance ?? loan.outstandingBalance,
  };
}
