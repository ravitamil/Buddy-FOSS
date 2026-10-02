import type {SubscriptionData} from '@/types/finance.types';
import type {PaymentRecord} from '@/types/loan.types';

const ACTIVE_COLOR = '#4ADE80';
const DISABLED_COLOR = '#EF4444';

type RouteParams = Record<string, string | string[] | undefined>;

export interface SubscriptionDetailReadModel {
  statusColor: string;
  nextBillingLabel: string;
  autoPayLabel: string;
  autoPayColor: string;
  reminderLabel: string;
  reminderColor: string;
  websiteLabel: string | null;
}

function firstRouteValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function resolveSubscriptionId(params: RouteParams): string {
  return firstRouteValue(params.id) || firstRouteValue(params.subscriptionId);
}

export function parsePaymentAmount(value: string): number | null {
  const amount = Number.parseFloat(value);
  return value && !Number.isNaN(amount) && amount > 0 ? amount : null;
}

export function buildSubscriptionDetailReadModel(
  subscription: SubscriptionData,
): SubscriptionDetailReadModel {
  return {
    statusColor:
      subscription.status === 'active'
        ? ACTIVE_COLOR
        : subscription.status === 'paused'
          ? '#EAB308'
          : DISABLED_COLOR,
    nextBillingLabel: new Date(subscription.nextBilling).toLocaleDateString(),
    autoPayLabel: subscription.autoPayEnabled ? 'Enabled' : 'Disabled',
    autoPayColor: subscription.autoPayEnabled ? ACTIVE_COLOR : DISABLED_COLOR,
    reminderLabel: subscription.reminderEnabled
      ? `${subscription.reminderDaysBefore} days before`
      : 'Disabled',
    reminderColor: subscription.reminderEnabled ? '#EC4899' : DISABLED_COLOR,
    websiteLabel: subscription.website?.replace(/^https?:\/\//, '') ?? null,
  };
}

export function getVisibleSubscriptionPayments(
  paymentHistory: PaymentRecord[],
  showAll: boolean,
): PaymentRecord[] {
  const visiblePayments = showAll ? [...paymentHistory] : paymentHistory.slice(0, 3);

  return visiblePayments.sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}
