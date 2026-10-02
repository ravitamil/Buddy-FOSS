import dayjs from 'dayjs';

import type {PaymentRecord} from '@/types/loan.types';
import type {PaymentFrequency} from './types';

export function calculateRemainingInstallments(
  totalTenure: number,
  paymentHistory: PaymentRecord[],
): number {
  const paidInstallments = paymentHistory.filter((payment) => payment.status === 'PAID').length;
  return Math.max(0, totalTenure - paidInstallments);
}

export function getInstallmentStatus(
  installmentNumber: number,
  paymentHistory: PaymentRecord[],
  currentDate: Date,
  dueDate: Date,
): 'completed' | 'current' | 'upcoming' | 'overdue' {
  const payment = paymentHistory.find((entry) => entry.installmentNumber === installmentNumber);

  if (payment?.status === 'PAID') {
    return 'completed';
  }

  const paidPayments = paymentHistory.filter((entry) => entry.status === 'PAID');
  const paymentsWithInstallmentNumbers = paymentHistory.filter(
    (entry) => entry.installmentNumber !== undefined && entry.installmentNumber !== null,
  );

  if (paidPayments.length > 0 && installmentNumber <= paidPayments.length) {
    if (paymentsWithInstallmentNumbers.length === 0) {
      return 'completed';
    }

    const hasSpecificPayment = paymentHistory.some(
      (entry) => entry.installmentNumber === installmentNumber,
    );
    if (!hasSpecificPayment) {
      return 'completed';
    }
  }

  const today = dayjs(currentDate).startOf('day');
  const due = dayjs(dueDate).startOf('day');
  const daysPastDue = today.diff(due, 'day');

  if (daysPastDue === 0) {
    return 'current';
  }

  if (daysPastDue > 30) {
    return 'overdue';
  }

  return daysPastDue > 0 ? 'current' : 'upcoming';
}

export function getSimplifiedInstallmentStatus(
  installmentNumber: number,
  paymentHistory: PaymentRecord[],
  startDate: Date,
  totalTenure: number,
  paymentFrequency: PaymentFrequency = 'MONTHLY',
): 'completed' | 'current' | 'upcoming' {
  const monthsElapsed = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  const installmentsElapsed = Math.min(
    totalTenure,
    paymentFrequency === 'WEEKLY'
      ? Math.floor(monthsElapsed * 4.33)
      : paymentFrequency === 'QUARTERLY'
        ? Math.floor(monthsElapsed / 3)
        : paymentFrequency === 'YEARLY'
          ? Math.floor(monthsElapsed / 12)
          : Math.floor(monthsElapsed),
  );

  const payment = paymentHistory.find((entry) => entry.installmentNumber === installmentNumber);
  if (payment?.status === 'PAID') {
    return 'completed';
  }

  if (installmentNumber <= installmentsElapsed) {
    return 'completed';
  }

  return installmentNumber === installmentsElapsed + 1 ? 'current' : 'upcoming';
}
