import {subscriptionDatabaseService} from './SubscriptionDatabaseService';
import {SubscriptionData} from '../types/finance.types';

describe('SubscriptionDatabaseService offline storage', () => {
  const sampleSub: SubscriptionData = {
    id: 'sub-test-1',
    name: 'Netflix',
    amount: 15,
    billingCycle: 'monthly',
    nextBilling: '2026-10-01',
    category: 'Entertainment',
    icon: 'film',
    color: '#E50914',
    status: 'active',
    autoPayEnabled: true,
    reminderEnabled: true,
    reminderDaysBefore: 3,
    paymentHistory: [],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  };

  it('saves and retrieves subscriptions locally', async () => {
    await subscriptionDatabaseService.saveSubscriptions('local_user', [sampleSub]);
    const subs = await subscriptionDatabaseService.getSubscriptions('local_user');
    expect(subs.some((s) => s.id === 'sub-test-1')).toBe(true);
  });

  it('records payment atomically and advances nextBilling', async () => {
    await subscriptionDatabaseService.saveSubscriptions('local_user', [sampleSub]);

    const result = await subscriptionDatabaseService.recordPaymentAtomic(
      'local_user',
      'sub-test-1',
      {
        amount: 15,
        date: '2026-10-01',
        status: 'PAID',
        method: 'card',
        principalPaid: 0,
        interestPaid: 0,
      },
      'op_key_1',
    );

    expect(result.paymentId).toBeDefined();
    expect(result.nextBilling).toBe('2026-11-01');

    const subs = await subscriptionDatabaseService.getSubscriptions('local_user');
    const updated = subs.find((s) => s.id === 'sub-test-1');
    expect(updated?.paymentHistory.length).toBeGreaterThan(0);
  });

  it('deletes a subscription locally', async () => {
    await subscriptionDatabaseService.deleteSubscription('local_user', 'sub-test-1');
    const subs = await subscriptionDatabaseService.getSubscriptions('local_user');
    expect(subs.some((s) => s.id === 'sub-test-1')).toBe(false);
  });
});
