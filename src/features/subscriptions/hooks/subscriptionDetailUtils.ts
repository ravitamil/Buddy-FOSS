import type {SubscriptionData} from '@/types/finance.types';
import type {PaymentRecord} from '@/types/loan.types';
import type {SubscriptionDetailAnalyticsViewModel} from './subscriptionDetailTypes';

interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

type ShowAlert = (config: {title: string; message: string; actions?: AlertAction[]}) => void;

export const toDateInput = (date: Date): string => date.toISOString().split('T')[0];

export const getNextMonthDateInput = (): string => {
  const nextMonth = new Date();
  const currentDay = nextMonth.getDate();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  if (nextMonth.getDate() !== currentDay) nextMonth.setDate(0);
  return toDateInput(nextMonth);
};

export const isDecimalInput = (text: string): boolean => /^\d*\.?\d*$/.test(text);

export function calculateYearlyCost(subscription: SubscriptionData): number {
  switch (subscription.billingCycle) {
    case 'weekly':
      return subscription.amount * 52;
    case 'monthly':
      return subscription.amount * 12;
    case 'quarterly':
      return subscription.amount * 4;
    case 'yearly':
      return subscription.amount;
    default:
      return subscription.amount;
  }
}

export function buildSubscriptionAnalytics(
  subscription: SubscriptionData,
): SubscriptionDetailAnalyticsViewModel {
  const paidPayments = subscription.paymentHistory.filter((payment) => payment.status === 'PAID');
  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const avgPayment = paidPayments.length > 0 ? totalPaid / paidPayments.length : 0;
  const nextBillingDate = new Date(subscription.nextBilling);
  const today = new Date();
  const daysUntilNext = Math.ceil(
    (nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    totalPaid,
    avgPayment,
    yearlyCost: calculateYearlyCost(subscription),
    daysUntilNext,
    paymentCount: paidPayments.length,
  };
}

export function buildShareContent(subscription: SubscriptionData, currency: string): string {
  return `
${subscription.name}
${currency} ${subscription.amount}/${subscription.billingCycle}
Next billing: ${new Date(subscription.nextBilling).toLocaleDateString()}
Status: ${subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
      `.trim();
}

export function normalizeWebsiteUrl(website: string): string {
  return website.startsWith('http') ? website : `https://${website}`;
}

export function createManualPaymentPayload(amount: number, date: Date): Omit<PaymentRecord, 'id'> {
  return {
    amount,
    date: toDateInput(date),
    method: 'manual',
    status: 'PAID',
    principalPaid: 0,
    interestPaid: 0,
    createdAt: new Date().toISOString(),
  };
}

export function createResumeSubscriptionActions({
  resumeSubscription,
  setSubscription,
  showAlert,
  subscriptionId,
}: {
  resumeSubscription: (id: string, nextBillingDate?: string) => Promise<SubscriptionData>;
  setSubscription: (subscription: SubscriptionData) => void;
  showAlert: ShowAlert;
  subscriptionId: string;
}): AlertAction[] {
  const resumeWithDate = (nextBillingDate?: string) => {
    void (async () => {
      const resumed = await resumeSubscription(subscriptionId, nextBillingDate);
      setSubscription(resumed);
      showAlert({
        title: 'Success',
        message: nextBillingDate
          ? 'Subscription resumed successfully!'
          : 'Subscription resumed successfully! Schedule maintained.',
        actions: [{text: 'OK'}],
      });
    })();
  };

  return [
    {text: 'Cancel', style: 'cancel'},
    {
      text: 'Keep Schedule',
      style: 'default',
      onPress: () => resumeWithDate(),
    },
    {
      text: 'Today',
      style: 'default',
      onPress: () => resumeWithDate(toDateInput(new Date())),
    },
    {
      text: 'Next Month',
      style: 'default',
      onPress: () => resumeWithDate(getNextMonthDateInput()),
    },
  ];
}
