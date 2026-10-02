import dayjs from 'dayjs';

import type {AmortizationEntry, LoanData} from '@/types/loan.types';
import {generateAmortizationSchedule} from './amortization';
import {calculateEMIValue} from './emi';
import type {EnhancedLoan} from '../context/loanContextTypes';

export const generateLoanAmortizationSchedule = (loan: EnhancedLoan): AmortizationEntry[] =>
  generateAmortizationSchedule({
    principal: loan.principalAmount,
    emiAmount: loan.emiAmount,
    annualInterestRate: loan.interestRate,
    tenureInMonths: loan.tenure,
    calculationMethod: 'REDUCING_BALANCE',
    paymentFrequency: loan.paymentFrequency ?? 'MONTHLY',
    startDate: dayjs(loan.startDate).format('YYYY-MM-DD'),
  }).map((entry) => ({
    ...entry,
    paymentDate: new Date(entry.paymentDate).toISOString(),
  }));

export const recalculateLoanTerms = (loan: EnhancedLoan): EnhancedLoan => {
  const updatedLoan = {...loan};

  if (updatedLoan.principalAmount && updatedLoan.interestRate >= 0 && updatedLoan.tenure) {
    updatedLoan.emiAmount = calculateEMIValue(
      updatedLoan.principalAmount,
      updatedLoan.interestRate,
      updatedLoan.tenure,
    );
  }

  if (updatedLoan.principalAmount && updatedLoan.emiAmount && updatedLoan.startDate) {
    updatedLoan.amortizationSchedule = generateLoanAmortizationSchedule(updatedLoan);
  }

  return updatedLoan;
};

export const normalizeLoanDates = (loan: LoanData | EnhancedLoan): EnhancedLoan => ({
  ...loan,
  startDate: loan.startDate instanceof Date ? loan.startDate : new Date(loan.startDate),
  nextEmiDate: loan.nextEmiDate instanceof Date ? loan.nextEmiDate : new Date(loan.nextEmiDate),
  disbursementDate: loan.disbursementDate ? new Date(loan.disbursementDate) : undefined,
  sanctionDate: loan.sanctionDate ? new Date(loan.sanctionDate) : undefined,
  firstEmiDate: loan.firstEmiDate ? new Date(loan.firstEmiDate) : undefined,
  projectedPayoffDate: loan.projectedPayoffDate ? new Date(loan.projectedPayoffDate) : undefined,
});

export const serializeLoanDates = (loan: EnhancedLoan): LoanData => ({
  ...loan,
  startDate: loan.startDate.toISOString(),
  nextEmiDate: loan.nextEmiDate.toISOString(),
  disbursementDate: loan.disbursementDate?.toISOString(),
  sanctionDate: loan.sanctionDate?.toISOString(),
  firstEmiDate: loan.firstEmiDate?.toISOString(),
  projectedPayoffDate: loan.projectedPayoffDate?.toISOString(),
  paymentFrequency: loan.paymentFrequency ?? 'MONTHLY',
});
