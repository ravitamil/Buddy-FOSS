import type {SubscriptionData, SubscriptionStats} from '@/types/finance.types';

export const getUpcomingSubscriptionRenewals = (
  subscriptions: SubscriptionData[],
  days: number = 30,
): SubscriptionData[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);

  return subscriptions
    .filter((subscription) => subscription.status === 'active' && subscription.nextBilling)
    .filter((subscription) => new Date(subscription.nextBilling) <= cutoffDate)
    .sort(
      (first, second) =>
        new Date(first.nextBilling).getTime() - new Date(second.nextBilling).getTime(),
    );
};

export const getSubscriptionMonthlyCost = (subscriptions: SubscriptionData[]): number =>
  subscriptions
    .filter((subscription) => subscription.status === 'active')
    .reduce((total, subscription) => {
      const monthlyAmount =
        subscription.billingCycle === 'yearly'
          ? subscription.amount / 12
          : subscription.billingCycle === 'quarterly'
            ? subscription.amount / 3
            : subscription.amount;
      return total + monthlyAmount;
    }, 0);

export const getSubscriptionYearlyCost = (subscriptions: SubscriptionData[]): number =>
  subscriptions
    .filter((subscription) => subscription.status === 'active')
    .reduce((total, subscription) => {
      const yearlyAmount =
        subscription.billingCycle === 'monthly'
          ? subscription.amount * 12
          : subscription.billingCycle === 'quarterly'
            ? subscription.amount * 4
            : subscription.amount;
      return total + yearlyAmount;
    }, 0);

export const buildSubscriptionStats = (
  subscriptions: SubscriptionData[],
  stats: SubscriptionStats | null,
): SubscriptionStats => {
  if (stats) return stats;

  return {
    totalMonthlySubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((subscription) => subscription.status === 'active')
      .length,
    upcomingPayments: getUpcomingSubscriptionRenewals(subscriptions, 30),
    overduePayments: subscriptions.filter(
      (subscription) =>
        subscription.status === 'active' && new Date(subscription.nextBilling) < new Date(),
    ),
  };
};
