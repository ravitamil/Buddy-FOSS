import type {PaymentRecord, SubscriptionData, SubscriptionStats} from '@/types/finance.types';

export type Subscription = SubscriptionData;

export interface SubscriptionContextType {
  subscriptions: SubscriptionData[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;
  stats: SubscriptionStats | null;

  addSubscription: (
    subscription: Omit<SubscriptionData, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<SubscriptionData>;
  updateSubscription: (id: string, updates: Partial<SubscriptionData>) => Promise<SubscriptionData>;
  deleteSubscription: (id: string) => Promise<void>;

  pauseSubscription: (id: string) => Promise<SubscriptionData>;
  resumeSubscription: (id: string, nextBilling?: string) => Promise<SubscriptionData>;
  addSubscriptionPayment: (
    id: string,
    payment: Omit<PaymentRecord, 'id' | 'createdAt'>,
  ) => Promise<SubscriptionData>;
  updateSubscriptionPayment: (
    id: string,
    paymentId: string,
    updates: Partial<PaymentRecord>,
  ) => Promise<SubscriptionData>;
  deleteSubscriptionPayment: (id: string, paymentId: string) => Promise<void>;

  getSubscriptionById: (id: string) => SubscriptionData | undefined;
  getUpcomingRenewals: (days: number) => SubscriptionData[];
  getMonthlyCost: () => number;
  getYearlyCost: () => number;
  getStats: () => SubscriptionStats;

  syncWithRemote: () => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
}
