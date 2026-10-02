import {PaymentRecord, SubscriptionData} from '../types/finance.types';
import {Transaction} from '../types';
import {logger as appLogger} from './LoggerService';
import {readJson, writeJson} from './storage/secureJsonStorage';
import {STORAGE_KEYS} from './storage/storageKeys';
import {transactionDatabaseService} from './TransactionDatabaseService';

const logger = appLogger.contextLogger('SubscriptionDatabaseService');

function computeNextBillingDate(
  currentDateStr: string,
  cycle: SubscriptionData['billingCycle'],
): string {
  const date = new Date(currentDateStr);
  if (isNaN(date.getTime())) {
    date.setTime(Date.now());
  }
  switch (cycle) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Subscription Database Service
 * Handles offline subscription persistence and payment tracking locally
 */
export const subscriptionDatabaseService = {
  async saveSubscriptions(_userId: string, subscriptions: SubscriptionData[]): Promise<void> {
    try {
      if (subscriptions.length === 0) return;

      const existing = await readJson<SubscriptionData[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
      const map = new Map<string, SubscriptionData>(existing.map((s) => [s.id, s]));

      for (const sub of subscriptions) {
        map.set(sub.id, {
          ...sub,
          paymentHistory: sub.paymentHistory || [],
          updatedAt: new Date().toISOString(),
        });
      }

      await writeJson(STORAGE_KEYS.SUBSCRIPTIONS, Array.from(map.values()));
    } catch (error) {
      logger.error('Error saving subscriptions:', error);
      throw error;
    }
  },

  async getSubscriptions(_userId: string): Promise<SubscriptionData[]> {
    try {
      const subscriptions = await readJson<SubscriptionData[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
      return subscriptions.map((sub) => ({
        ...sub,
        paymentHistory: sub.paymentHistory || [],
      }));
    } catch (error) {
      logger.error('Error getting subscriptions:', error);
      return [];
    }
  },

  async deleteSubscription(_userId: string, subscriptionId: string): Promise<void> {
    try {
      const existing = await readJson<SubscriptionData[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
      const remaining = existing.filter((s) => s.id !== subscriptionId);
      await writeJson(STORAGE_KEYS.SUBSCRIPTIONS, remaining);
    } catch (error) {
      logger.error('Error deleting subscription:', error);
      throw error;
    }
  },

  async recordPaymentAtomic(
    userId: string,
    subscriptionId: string,
    payment: Omit<PaymentRecord, 'id' | 'createdAt'>,
    _operationKey: string,
  ): Promise<{paymentId: string; transactionId?: string; nextBilling?: string}> {
    try {
      const subscriptions = await readJson<SubscriptionData[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
      const subIndex = subscriptions.findIndex((s) => s.id === subscriptionId);

      if (subIndex === -1) {
        throw new Error('Subscription not found');
      }

      const sub = subscriptions[subIndex];
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const paymentDate = payment.date || new Date().toISOString();

      const newPayment: PaymentRecord = {
        id: paymentId,
        amount: payment.amount,
        date: paymentDate,
        principalPaid: payment.principalPaid || 0,
        interestPaid: payment.interestPaid || 0,
        status: payment.status,
        method: payment.method || 'card',
        note: payment.note,
        createdAt: new Date().toISOString(),
      };

      const nextBilling = computeNextBillingDate(sub.nextBilling, sub.billingCycle);

      const updatedSub: SubscriptionData = {
        ...sub,
        nextBilling,
        paymentHistory: [newPayment, ...(sub.paymentHistory || [])],
        updatedAt: new Date().toISOString(),
      };

      subscriptions[subIndex] = updatedSub;
      await writeJson(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);

      const transaction: Transaction = {
        id: transactionId,
        amount: payment.amount,
        type: 'expense',
        category: sub.category || 'Subscription',
        categoryId: sub.category || 'subscriptions',
        description: `Subscription: ${sub.name}`,
        date: paymentDate,
        subscriptionId: sub.id,
        notes: payment.note,
        tags: ['subscription', sub.name.toLowerCase()],
        lastModified: new Date(),
      };

      await transactionDatabaseService.saveTransactions(userId, [transaction]);

      return {
        paymentId,
        transactionId,
        nextBilling,
      };
    } catch (error) {
      logger.error('Error recording subscription payment:', error);
      throw error;
    }
  },

  async updatePaymentAtomic(
    _userId: string,
    subscriptionId: string,
    payment: PaymentRecord,
  ): Promise<void> {
    try {
      const subscriptions = await readJson<SubscriptionData[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
      const subIndex = subscriptions.findIndex((s) => s.id === subscriptionId);

      if (subIndex === -1) return;

      const sub = subscriptions[subIndex];
      const updatedHistory = (sub.paymentHistory || []).map((p) =>
        p.id === payment.id ? {...p, ...payment} : p,
      );

      subscriptions[subIndex] = {
        ...sub,
        paymentHistory: updatedHistory,
        updatedAt: new Date().toISOString(),
      };

      await writeJson(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    } catch (error) {
      logger.error('Error updating subscription payment:', error);
      throw error;
    }
  },

  async deletePayment(_userId: string, subscriptionId: string, paymentId: string): Promise<void> {
    try {
      const subscriptions = await readJson<SubscriptionData[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
      const subIndex = subscriptions.findIndex((s) => s.id === subscriptionId);

      if (subIndex === -1) return;

      const sub = subscriptions[subIndex];
      const updatedHistory = (sub.paymentHistory || []).filter((p) => p.id !== paymentId);

      subscriptions[subIndex] = {
        ...sub,
        paymentHistory: updatedHistory,
        updatedAt: new Date().toISOString(),
      };

      await writeJson(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    } catch (error) {
      logger.error('Error deleting subscription payment:', error);
      throw error;
    }
  },
};
