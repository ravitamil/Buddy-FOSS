import dayjs from 'dayjs';

import type {
  DebtPayoffLoan,
  DebtPayoffPlan,
  DebtPayoffScheduleEntry,
  DebtPayoffStrategy,
  LoanPaymentDetail,
  MonthlyPaymentEntry,
  PaymentSchedule,
} from '../../types/debt.types';
import type {LoanData} from '../../types/loan.types';
import {getActiveLoans, sortActiveLoansByAvalanche} from './debtPayoffStrategies';

interface WorkingLoan extends LoanData {
  remainingBalance: number;
  isPaidOff: boolean;
}

export function calculatePayoffPlan(
  sortedLoans: LoanData[],
  strategy: DebtPayoffStrategy,
): DebtPayoffPlan {
  const payoffLoans: DebtPayoffLoan[] = [];
  const payoffSchedule: DebtPayoffScheduleEntry[] = [];
  let totalInterestSavings = 0;
  let currentDate = dayjs();
  let totalMonths = 0;

  const workingLoans = sortedLoans.map((loan, index) => ({
    ...loan,
    payoffOrder: index + 1,
    remainingBalance: loan.currentOutstanding,
    totalInterestPaid: 0,
    monthsToPayoff: 0,
  }));

  for (const workingLoan of workingLoans) {
    const months = calculateMonthsToPayoff(
      workingLoan.remainingBalance,
      workingLoan.interestRate,
      workingLoan.emiAmount || 0,
    );
    const payoffLoan: DebtPayoffLoan = {
      id: workingLoan.id,
      name: workingLoan.name,
      balance: workingLoan.currentOutstanding,
      interestRate: workingLoan.interestRate,
      minimumPayment: workingLoan.emiAmount || 0,
      extraPayment: 0,
      payoffOrder: workingLoan.payoffOrder,
      projectedPayoffDate: currentDate.add(months, 'month').toISOString(),
      interestSavings: calculateInterestSavings(workingLoan),
    };

    payoffLoans.push(payoffLoan);
    totalInterestSavings += payoffLoan.interestSavings;
    currentDate = currentDate.add(months, 'month');
    totalMonths += months;
  }

  return {
    strategy,
    loans: payoffLoans,
    totalInterestSavings,
    yearsToPayoff: totalMonths / 12,
    payoffSchedule,
  };
}

export function optimizePaymentSchedule(
  loans: LoanData[],
  extraPayment: number,
  respectOrder: boolean = false,
): PaymentSchedule {
  if (extraPayment <= 0) {
    return createBasicPaymentSchedule(loans);
  }

  const sortedLoans = respectOrder ? getActiveLoans(loans) : sortActiveLoansByAvalanche(loans);
  const schedule: MonthlyPaymentEntry[] = [];
  let currentDate = dayjs();
  let totalMonths = 0;
  let totalInterest = 0;
  let totalPayments = 0;
  const workingLoans = createWorkingLoans(sortedLoans);

  while (workingLoans.some((loan) => !loan.isPaidOff) && totalMonths < 600) {
    totalMonths++;
    currentDate = currentDate.add(1, 'month');

    const monthlyEntry = createMonthlyPaymentEntry(totalMonths, currentDate.toISOString());
    let remainingExtra = extraPayment;

    for (const loan of workingLoans) {
      if (loan.isPaidOff) continue;

      const {loanDetail, extraAfterPayment} = applyMonthlyPayment(loan, remainingExtra);
      remainingExtra = extraAfterPayment;
      monthlyEntry.loans.push(loanDetail);
      monthlyEntry.totalPayment += loanDetail.payment;
      monthlyEntry.totalPrincipal += loanDetail.principal;
      monthlyEntry.totalInterest += loanDetail.interest;
    }

    totalPayments += monthlyEntry.totalPayment;
    totalInterest += monthlyEntry.totalInterest;
    schedule.push(monthlyEntry);

    if (remainingExtra > 0) {
      totalPayments += applyRemainingExtraPayment(workingLoans, monthlyEntry, remainingExtra);
    }
  }

  return {
    totalMonths,
    totalInterestPaid: totalInterest,
    totalPayments,
    schedule,
  };
}

export function calculateMonthsToPayoff(
  balance: number,
  interestRate: number,
  monthlyPayment: number,
): number {
  if (balance <= 0 || monthlyPayment <= 0) return 0;

  const monthlyRate = interestRate / 100 / 12;
  if (monthlyRate <= 0) {
    return Math.ceil(balance / monthlyPayment);
  }

  const numerator = 1 - (balance * monthlyRate) / monthlyPayment;
  if (numerator <= 0) return Infinity;

  const months = -Math.log(numerator) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
}

function calculateInterestSavings(loan: LoanData): number {
  const originalInterest = loan.totalInterest || 0;
  return originalInterest * 0.1;
}

function createBasicPaymentSchedule(loans: LoanData[]): PaymentSchedule {
  const schedule: MonthlyPaymentEntry[] = [];
  let currentDate = dayjs();
  let totalMonths = 0;
  let totalInterest = 0;
  let totalPayments = 0;

  for (let i = 0; i < 12; i++) {
    totalMonths++;
    currentDate = currentDate.add(1, 'month');

    const monthlyEntry = createMonthlyPaymentEntry(totalMonths, currentDate.toISOString());

    for (const loan of loans) {
      if (loan.status !== 'ACTIVE') continue;

      const loanDetail = createBasicLoanPaymentDetail(loan);
      monthlyEntry.loans.push(loanDetail);
      monthlyEntry.totalPayment += loanDetail.payment;
      monthlyEntry.totalPrincipal += loanDetail.principal;
      monthlyEntry.totalInterest += loanDetail.interest;
    }

    totalPayments += monthlyEntry.totalPayment;
    totalInterest += monthlyEntry.totalInterest;
    schedule.push(monthlyEntry);
  }

  return {
    totalMonths,
    totalInterestPaid: totalInterest,
    totalPayments,
    schedule,
  };
}

function createWorkingLoans(loans: LoanData[]): WorkingLoan[] {
  return loans.map((loan) => ({
    ...loan,
    remainingBalance: loan.currentOutstanding,
    isPaidOff: loan.currentOutstanding <= 0,
  }));
}

function createMonthlyPaymentEntry(month: number, date: string): MonthlyPaymentEntry {
  return {
    month,
    date,
    loans: [],
    totalPayment: 0,
    totalPrincipal: 0,
    totalInterest: 0,
  };
}

function applyMonthlyPayment(
  loan: WorkingLoan,
  remainingExtra: number,
): {loanDetail: LoanPaymentDetail; extraAfterPayment: number} {
  const minimumPayment = loan.emiAmount || 0;
  const extraApplied = remainingExtra > 0 ? remainingExtra : 0;
  const totalPayment = minimumPayment + extraApplied;
  const monthlyInterestRate = loan.interestRate / 100 / 12;
  const interestPayment = loan.remainingBalance * monthlyInterestRate;
  const principalPayment = Math.min(totalPayment - interestPayment, loan.remainingBalance);

  loan.remainingBalance -= principalPayment;

  if (loan.remainingBalance <= 0) {
    loan.isPaidOff = true;
    loan.remainingBalance = 0;
  }

  return {
    loanDetail: {
      loanId: loan.id,
      loanName: loan.name,
      payment: totalPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: loan.remainingBalance,
      isPaidOff: loan.isPaidOff,
    },
    extraAfterPayment: extraApplied > 0 ? 0 : remainingExtra,
  };
}

function applyRemainingExtraPayment(
  workingLoans: WorkingLoan[],
  monthlyEntry: MonthlyPaymentEntry,
  remainingExtra: number,
): number {
  const nextLoan = workingLoans.find((loan) => !loan.isPaidOff);
  if (!nextLoan) return 0;

  const nextLoanDetail = monthlyEntry.loans.find((loan) => loan.loanId === nextLoan.id);
  if (!nextLoanDetail) return 0;

  nextLoanDetail.payment += remainingExtra;
  nextLoanDetail.principal += remainingExtra;
  nextLoan.remainingBalance -= remainingExtra;

  if (nextLoan.remainingBalance <= 0) {
    nextLoanDetail.isPaidOff = true;
    nextLoan.remainingBalance = 0;
  }

  monthlyEntry.totalPayment += remainingExtra;
  monthlyEntry.totalPrincipal += remainingExtra;
  return remainingExtra;
}

function createBasicLoanPaymentDetail(loan: LoanData): LoanPaymentDetail {
  const minimumPayment = loan.emiAmount || 0;
  const monthlyInterestRate = loan.interestRate / 100 / 12;
  const interestPayment = (loan.currentOutstanding || 0) * monthlyInterestRate;
  const principalPayment = minimumPayment - interestPayment;

  return {
    loanId: loan.id,
    loanName: loan.name,
    payment: minimumPayment,
    principal: principalPayment,
    interest: interestPayment,
    balance: loan.currentOutstanding || 0,
    isPaidOff: false,
  };
}
