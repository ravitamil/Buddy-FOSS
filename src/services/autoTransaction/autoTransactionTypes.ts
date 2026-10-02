import type {LoanData} from '../../types/loan.types';
import type {SubscriptionData} from '../../types/finance.types';
import type {PaymentRecord} from '../../types/loan.types';

export type RecordLoanPaymentFunction = (loanId: string, payment: unknown) => Promise<void>;
export type RecordSubscriptionPaymentFunction = (
  subscriptionId: string,
  payment: Omit<PaymentRecord, 'id' | 'createdAt'>,
) => Promise<void>;

export interface ScheduledPayment {
  id: string;
  sourceType: 'subscription' | 'loan';
  sourceId: string;
  dueDate: string;
  amount: number;
  description: string;
  lastProcessed?: string;
  isEnabled: boolean;
}

export interface PaymentStats {
  totalScheduled: number;
  activeScheduled: number;
  upcomingThisMonth: number;
  lastProcessedDate: string | null;
}

export type AutoPaymentSource = SubscriptionData | LoanData;
