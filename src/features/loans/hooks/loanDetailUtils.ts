import dayjs from 'dayjs';
import type {EnhancedLoan} from '@/context/LoanContext.query';
import type {LoanData, PaymentRecord} from '@/types/loan.types';
import {calculateLoanMetrics} from '@/features/loans/calculations';
import type {
  IoniconName,
  LoanDetailMetricsViewModel,
  LoanInstallmentDetail,
} from './loanDetailTypes';

export const dateToIso = (date: Date | string | undefined): string | undefined => {
  if (!date) return undefined;
  return typeof date === 'string' ? date : date.toISOString();
};

export const mapEnhancedLoanToLoanData = (enhancedLoan: EnhancedLoan): LoanData => ({
  ...enhancedLoan,
  startDate: dateToIso(enhancedLoan.startDate) ?? new Date().toISOString(),
  nextEmiDate: dateToIso(enhancedLoan.nextEmiDate) ?? new Date().toISOString(),
  disbursementDate: dateToIso(enhancedLoan.disbursementDate),
  sanctionDate: dateToIso(enhancedLoan.sanctionDate),
  firstEmiDate: dateToIso(enhancedLoan.firstEmiDate),
  createdAt: dateToIso(enhancedLoan.createdAt) ?? new Date().toISOString(),
  updatedAt: dateToIso(enhancedLoan.updatedAt) ?? new Date().toISOString(),
  projectedPayoffDate: dateToIso(enhancedLoan.projectedPayoffDate),
  paymentFrequency: enhancedLoan.paymentFrequency ?? 'MONTHLY',
  paymentHistory: enhancedLoan.paymentHistory.map((payment) => ({
    ...payment,
    date: dateToIso(payment.date) ?? new Date().toISOString(),
  })),
});

export function buildLoanDetailMetrics(loan: LoanData): LoanDetailMetricsViewModel {
  const loanMetrics = calculateLoanMetrics(loan);
  const maturityDate = new Date(loanMetrics.maturityDate);

  return {
    maturityDate,
    maturityDateText: loanMetrics.maturityDate,
    progressPercentage: loanMetrics.progressPercentage,
    completedTenure: loanMetrics.completedTenure,
    remainingTenure: loanMetrics.remainingTenure,
    amountLeft: loanMetrics.remainingAmount,
    paidAmount: loanMetrics.paidAmount,
    totalAmount: loanMetrics.totalAmount,
    isLoanCompleted: loanMetrics.isLoanCompleted,
    nextEmiDate: calculateNextEmiDate(loan),
    totalInterestPaid: calculateTotalInterestPaid(loan.paymentHistory ?? []),
    loanColor: getLoanColor(loan),
    loanIcon: getLoanIcon(loan),
  };
}

export function findCurrentMonthPayment(paymentHistory: PaymentRecord[] | undefined) {
  if (!paymentHistory) return undefined;

  const today = new Date();
  return paymentHistory.find((payment) => {
    const paymentDate = new Date(payment.date);
    return (
      paymentDate.getMonth() === today.getMonth() &&
      paymentDate.getFullYear() === today.getFullYear() &&
      payment.status === 'PAID'
    );
  });
}

export function createManualPayment(paymentAmount: number): Omit<PaymentRecord, 'id'> {
  return {
    amount: paymentAmount,
    date: new Date().toISOString().split('T')[0],
    status: 'PAID',
    method: 'manual',
    principalPaid: paymentAmount * 0.8,
    interestPaid: paymentAmount * 0.2,
    createdAt: new Date().toISOString(),
  };
}

export function createAdditionalPayment(paymentAmount: number): Omit<PaymentRecord, 'id'> {
  return {
    amount: paymentAmount,
    date: new Date().toISOString().split('T')[0],
    status: 'PAID',
    method: 'manual_additional',
    principalPaid: paymentAmount,
    interestPaid: 0,
    createdAt: new Date().toISOString(),
  };
}

export function buildInstallmentDetail(
  loan: LoanData,
  installmentNumber: number,
): LoanInstallmentDetail {
  const installmentDate = dayjs(loan.firstEmiDate || loan.startDate).add(
    installmentNumber - 1,
    'month',
  );
  const payment = loan.paymentHistory?.find((record) => {
    const paymentDate = dayjs(record.date);
    return (
      paymentDate.month() === installmentDate.month() &&
      paymentDate.year() === installmentDate.year()
    );
  });

  const monthlyInterestRate = loan.interestRate / 100 / 12;
  const remainingPrincipal =
    loan.principalAmount -
    (installmentNumber - 1) * (loan.emiAmount - loan.principalAmount * monthlyInterestRate);
  const interestAmount = remainingPrincipal * monthlyInterestRate;
  const principalAmount = loan.emiAmount - interestAmount;
  const isOverdue = installmentDate.isBefore(dayjs(), 'day');

  return {
    installmentNumber,
    dueDate: installmentDate.toDate(),
    amount: loan.emiAmount,
    principalAmount: Math.max(0, principalAmount),
    interestAmount: Math.max(0, interestAmount),
    outstandingBalance: Math.max(0, remainingPrincipal - principalAmount),
    isPaid: Boolean(payment),
    paidDate: payment?.date ? new Date(payment.date) : undefined,
    status: payment ? 'paid' : isOverdue ? 'overdue' : 'upcoming',
  };
}

function getLoanIcon(loan: LoanData): IoniconName {
  if (loan.icon) return loan.icon as IoniconName;

  switch (loan.loanType) {
    case 'HOME':
      return 'home-outline';
    case 'PERSONAL':
      return 'person-outline';
    case 'AUTO':
      return 'car-outline';
    case 'CREDIT_CARD':
      return 'card-outline';
    case 'EDUCATION':
      return 'school-outline';
    case 'BUSINESS':
      return 'briefcase-outline';
    default:
      return 'card-outline';
  }
}

function getLoanColor(loan: LoanData): string {
  if (loan.color) return loan.color;

  switch (loan.loanType) {
    case 'HOME':
      return '#3B82F6';
    case 'PERSONAL':
      return '#8B5CF6';
    case 'AUTO':
      return '#10B981';
    case 'CREDIT_CARD':
      return '#6366F1';
    case 'EDUCATION':
      return '#F59E0B';
    case 'BUSINESS':
      return '#EF4444';
    default:
      return '#6B7280';
  }
}

function calculateNextEmiDate(loan: LoanData): Date {
  const firstEmiDate = loan.firstEmiDate || loan.startDate;
  if (!firstEmiDate) return new Date();

  const today = dayjs();
  let nextEmi = dayjs(firstEmiDate);
  while (nextEmi.isBefore(today, 'day')) {
    nextEmi = nextEmi.add(1, 'month');
  }

  return nextEmi.toDate();
}

function calculateTotalInterestPaid(paymentHistory: PaymentRecord[]): number {
  return paymentHistory
    .filter((payment) => payment.status === 'PAID')
    .reduce((sum, payment) => sum + (payment.interestPaid || 0), 0);
}
