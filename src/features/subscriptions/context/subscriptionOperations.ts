import type {PaymentRecord, SubscriptionData} from '@/types/finance.types';

export const buildPausedSubscription = (subscription: SubscriptionData): SubscriptionData => ({
  ...subscription,
  status: 'paused',
});

export const buildResumedSubscription = (
  subscription: SubscriptionData,
  nextBilling?: string,
): SubscriptionData => ({
  ...subscription,
  status: 'active',
  nextBilling: nextBilling ?? subscription.nextBilling,
});

export const appendSubscriptionPayment = (
  subscription: SubscriptionData,
  payment: Omit<PaymentRecord, 'id' | 'createdAt'>,
  createId: () => string,
): {subscription: SubscriptionData; paymentHistory: PaymentRecord[]} => {
  const newPayment: PaymentRecord = {
    ...payment,
    id: createId(),
    createdAt: new Date().toISOString(),
  };
  const paymentHistory = [...(subscription.paymentHistory || []), newPayment];
  return {
    subscription: {...subscription, paymentHistory},
    paymentHistory,
  };
};

export const updatePaymentInSubscription = (
  subscription: SubscriptionData,
  paymentId: string,
  updates: Partial<PaymentRecord>,
): {subscription: SubscriptionData; paymentHistory: PaymentRecord[]} => {
  const paymentHistory = (subscription.paymentHistory || []).map((payment) =>
    payment.id === paymentId ? {...payment, ...updates} : payment,
  );
  return {
    subscription: {...subscription, paymentHistory},
    paymentHistory,
  };
};

export const removePaymentFromSubscription = (
  subscription: SubscriptionData,
  paymentId: string,
): PaymentRecord[] =>
  (subscription.paymentHistory || []).filter((payment) => payment.id !== paymentId);
