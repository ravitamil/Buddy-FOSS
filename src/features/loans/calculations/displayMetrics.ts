import dayjs from 'dayjs';

import type {LoanData, PaymentRecord} from '@/types/loan.types';
import {calculateMaturityDate} from './amortization';
import type {LoanDisplayMetrics} from './types';

export function calculateCompletedTenure(
  startDate: string | Date,
  currentDate = new Date(),
): number {
  const start = dayjs(startDate);
  const today = dayjs(currentDate);
  const diffYears = today.diff(start, 'year');
  const diffMonths = today.diff(start.add(diffYears, 'year'), 'month');

  return Math.max(0, diffYears * 12 + diffMonths);
}

export function calculateRemainingTenure(
  totalTenure: number,
  startDate: string | Date,
  currentDate = new Date(),
): number {
  return Math.max(0, totalTenure - calculateCompletedTenure(startDate, currentDate));
}

export function calculateTotalAmount(emiAmount: number, totalTenure: number): number {
  return emiAmount * totalTenure;
}

export function calculateRemainingAmount(emiAmount: number, remainingInstallments: number): number;
export function calculateRemainingAmount(
  emiAmount: number,
  startDate: string | Date,
  totalTenure: number,
): number;
export function calculateRemainingAmount(
  emiAmount: number,
  remainingInstallmentsOrStartDate: number | string | Date,
  totalTenure?: number,
): number {
  const remainingInstallments =
    typeof remainingInstallmentsOrStartDate === 'number'
      ? remainingInstallmentsOrStartDate
      : calculateRemainingTenure(totalTenure ?? 0, remainingInstallmentsOrStartDate);

  return Math.round(emiAmount * remainingInstallments * 100) / 100;
}

export function calculatePaidAmount(
  emiAmount: number,
  startDate: string | Date,
  totalTenure?: number,
  currentDate = new Date(),
): number {
  const paidAmount = calculateCompletedTenure(startDate, currentDate) * emiAmount;

  if (totalTenure) {
    return Math.min(paidAmount, calculateTotalAmount(emiAmount, totalTenure));
  }

  return paidAmount;
}

export function calculateLoanProgress(totalTenure: number, paymentHistory: PaymentRecord[]): number;
export function calculateLoanProgress(totalTenure: number, startDate: string | Date): number;
export function calculateLoanProgress(
  totalTenure: number,
  paymentHistoryOrStartDate: PaymentRecord[] | string | Date,
): number {
  if (Array.isArray(paymentHistoryOrStartDate)) {
    const paidInstallments = paymentHistoryOrStartDate.filter(
      (payment) => payment.status === 'PAID',
    ).length;
    return totalTenure > 0 ? Math.round((paidInstallments / totalTenure) * 100) : 0;
  }

  const completedTenure = calculateCompletedTenure(paymentHistoryOrStartDate);
  return Math.min(100, Math.max(0, (completedTenure / totalTenure) * 100));
}

export function calculateLoanMetrics(
  loan: Pick<LoanData, 'id' | 'lenderName' | 'emiAmount' | 'tenure'> & {
    startDate: string | Date;
  },
  currentDate = new Date(),
): LoanDisplayMetrics {
  const totalAmount = calculateTotalAmount(loan.emiAmount, loan.tenure);
  const completedTenure = calculateCompletedTenure(loan.startDate, currentDate);
  const remainingTenure = calculateRemainingTenure(loan.tenure, loan.startDate, currentDate);
  const maturityDate = calculateMaturityDate(
    String(dayjs(loan.startDate).format('YYYY-MM-DD')),
    loan.tenure,
  );
  const remainingAmount = calculateRemainingAmount(loan.emiAmount, remainingTenure);
  const paidAmount =
    remainingTenure === 0 ? totalAmount : Math.min(completedTenure * loan.emiAmount, totalAmount);

  return {
    totalAmount,
    completedTenure,
    remainingTenure,
    maturityDate,
    remainingAmount: remainingTenure === 0 ? 0 : Math.max(0, remainingAmount),
    paidAmount,
    progressPercentage: Math.min(100, Math.max(0, (completedTenure / loan.tenure) * 100)),
    isLoanCompleted: remainingTenure === 0,
  };
}

export function formatCurrency(amount: number, currency = '\u20B9'): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

  if (safeAmount >= 10000000) {
    const crores = safeAmount / 10000000;
    return `${currency}${crores >= 100 ? Math.round(crores) : crores.toFixed(crores >= 10 ? 1 : 2)}C`;
  }

  if (safeAmount >= 100000) {
    const lakhs = safeAmount / 100000;
    return `${currency}${lakhs.toFixed(lakhs >= 10 ? 1 : 2)}L`;
  }

  if (safeAmount >= 1000) {
    const thousands = safeAmount / 1000;
    return `${currency}${thousands.toFixed(thousands >= 10 ? 1 : 2)}K`;
  }

  return `${currency}${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('MMM DD, YYYY');
}
