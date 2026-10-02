import {PaymentRecord} from '../../types/loan.types';
import {SubscriptionData, TrackerStats} from '../../types/finance.types';

export function calculateNextBillingDate(currentDateStr: string, cycle: string): string {
  const currentDate = new Date(currentDateStr);

  switch (cycle) {
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'quarterly':
      currentDate.setMonth(currentDate.getMonth() + 3);
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
  }

  return currentDate.toISOString().split('T')[0];
}

export function calculateUtcNextBillingDate(currentDateStr: string, cycle: string): string {
  const date = new Date(currentDateStr);
  const originalDay = date.getUTCDate();

  switch (cycle) {
    case 'weekly':
      date.setUTCDate(date.getUTCDate() + 7);
      break;
    case 'monthly':
      date.setUTCMonth(date.getUTCMonth() + 1);
      resetToPreviousMonthEndOnOverflow(date, originalDay);
      break;
    case 'quarterly':
      date.setUTCMonth(date.getUTCMonth() + 3);
      resetToPreviousMonthEndOnOverflow(date, originalDay);
      break;
    case 'yearly':
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      resetToPreviousMonthEndOnOverflow(date, originalDay);
      break;
  }

  return date.toISOString().split('T')[0];
}

export function createSubscriptionPaymentRecord(
  payment: Omit<PaymentRecord, 'id' | 'createdAt'>,
): PaymentRecord {
  return {
    ...payment,
    id: Date.now().toString(),
    principalPaid: 0,
    interestPaid: 0,
    method: payment.method || 'manual_transfer',
    createdAt: new Date().toISOString(),
  };
}

export function calculateTrackerStats(subscriptions: SubscriptionData[]): TrackerStats {
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'active',
  );

  const totalMonthlySubscriptions = activeSubscriptions.reduce(
    (total, subscription) => total + toMonthlyAmount(subscription),
    0,
  );

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingPayments = activeSubscriptions.filter((subscription) => {
    const nextBilling = new Date(subscription.nextBilling);
    return nextBilling >= today && nextBilling <= nextWeek;
  });

  const overduePayments = activeSubscriptions.filter((subscription) => {
    const nextBilling = new Date(subscription.nextBilling);
    return nextBilling < today;
  });

  return {
    totalMonthlySubscriptions,
    activeSubscriptions: activeSubscriptions.length,
    upcomingPayments,
    overduePayments,
  };
}

function toMonthlyAmount(subscription: SubscriptionData): number {
  switch (subscription.billingCycle) {
    case 'weekly':
      return subscription.amount * 4.33;
    case 'monthly':
      return subscription.amount;
    case 'quarterly':
      return subscription.amount / 3;
    case 'yearly':
      return subscription.amount / 12;
    default:
      return subscription.amount;
  }
}

function resetToPreviousMonthEndOnOverflow(date: Date, originalDay: number): void {
  if (date.getUTCDate() !== originalDay) {
    date.setUTCDate(0);
  }
}
