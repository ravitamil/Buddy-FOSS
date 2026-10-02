import {PaymentRecord} from './loan.types';

export type {PaymentRecord} from './loan.types';

export interface SubscriptionData {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextBilling: string;
  category: string;
  icon: string;
  color: string;
  status: 'active' | 'paused' | 'cancelled';
  description?: string;
  website?: string;
  autoPayEnabled: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  paymentHistory: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackerData {
  subscriptions: SubscriptionData[];
}

export interface TrackerStats {
  totalMonthlySubscriptions: number;
  activeSubscriptions: number;
  upcomingPayments: SubscriptionData[];
  overduePayments: SubscriptionData[];
}

export interface SubscriptionStats {
  totalMonthlySubscriptions: number;
  activeSubscriptions: number;
  upcomingPayments: SubscriptionData[];
  overduePayments: SubscriptionData[];
}
