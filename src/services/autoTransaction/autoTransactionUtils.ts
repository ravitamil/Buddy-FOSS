import dayjs from 'dayjs';

import type {SubscriptionData} from '../../types/finance.types';
import type {LoanData} from '../../types/loan.types';
import type {PaymentStats, ScheduledPayment} from './autoTransactionTypes';

export function parseScheduledPayments(data: string | null): ScheduledPayment[] {
  if (!data) {
    return [];
  }

  return JSON.parse(data) as ScheduledPayment[];
}

export function getProcessedPaymentKey(sourceId: string, date: string): string {
  return `@processed_${sourceId}_${date}`;
}

export function isPaymentDue(dueDate: string, today: dayjs.Dayjs): boolean {
  const paymentDate = dayjs(dueDate);
  return paymentDate.isSame(today, 'day') || paymentDate.isBefore(today, 'day');
}

export function isUpcomingPayment(payment: ScheduledPayment, today: dayjs.Dayjs): boolean {
  if (!payment.isEnabled) return false;

  const paymentDate = dayjs(payment.dueDate);
  const thirtyDaysFromNow = dayjs().add(30, 'day');

  return (
    ((paymentDate.isSame(today, 'day') || paymentDate.isAfter(today, 'day')) &&
      paymentDate.isSame(thirtyDaysFromNow, 'day')) ||
    paymentDate.isBefore(thirtyDaysFromNow, 'day')
  );
}

export function createSubscriptionPaymentPayload(subscription: SubscriptionData) {
  return {
    amount: subscription.amount,
    date: dayjs().format('YYYY-MM-DD'),
    status: 'PAID' as const,
    method: 'auto_debit',
    note: 'Auto-generated payment',
    principalPaid: 0,
    interestPaid: 0,
  };
}

export function createLoanPaymentPayload(loan: LoanData, note: string) {
  const monthlyInterest = Math.min(
    loan.emiAmount,
    Math.max(0, loan.currentOutstanding * (loan.interestRate / 100 / 12)),
  );
  return {
    amount: loan.emiAmount,
    date: dayjs().format('YYYY-MM-DD'),
    status: 'PAID' as const,
    method: 'auto_track',
    note,
    principalPaid: Math.max(0, loan.emiAmount - monthlyInterest),
    interestPaid: monthlyInterest,
    createdAt: new Date().toISOString(),
  };
}

export function buildScheduledPayments(params: {
  subscriptions: SubscriptionData[];
  loans: LoanData[];
}): ScheduledPayment[] {
  return [
    ...params.subscriptions.flatMap((subscription) =>
      subscription.status === 'active' ? [buildSubscriptionScheduledPayment(subscription)] : [],
    ),
    ...params.loans.flatMap((loan) =>
      loan.currentOutstanding > 0 ? [buildLoanScheduledPayment(loan)] : [],
    ),
  ];
}

export function createPaymentStats(params: {
  scheduledPayments: ScheduledPayment[];
  upcomingPayments: ScheduledPayment[];
  lastProcessedDate: string | null;
}): PaymentStats {
  return {
    totalScheduled: params.scheduledPayments.length,
    activeScheduled: params.scheduledPayments.filter((payment) => payment.isEnabled).length,
    upcomingThisMonth: params.upcomingPayments.length,
    lastProcessedDate: params.lastProcessedDate,
  };
}

export function emptyPaymentStats(): PaymentStats {
  return {
    totalScheduled: 0,
    activeScheduled: 0,
    upcomingThisMonth: 0,
    lastProcessedDate: null,
  };
}

function buildSubscriptionScheduledPayment(subscription: SubscriptionData): ScheduledPayment {
  return {
    id: `sub_${subscription.id}`,
    sourceType: 'subscription',
    sourceId: subscription.id,
    dueDate: subscription.nextBilling,
    amount: subscription.amount,
    description: `${subscription.name} - ${subscription.billingCycle}`,
    isEnabled: subscription.autoPayEnabled ?? false,
  };
}

function buildLoanScheduledPayment(loan: LoanData): ScheduledPayment {
  return {
    id: `loan_${loan.id}`,
    sourceType: 'loan',
    sourceId: loan.id,
    dueDate: loan.nextEmiDate,
    amount: loan.emiAmount,
    description: `${loan.name} - EMI`,
    isEnabled: loan.autoPayEnabled ?? false,
  };
}
