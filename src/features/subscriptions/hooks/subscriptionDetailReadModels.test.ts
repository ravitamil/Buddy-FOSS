import type {SubscriptionData} from '@/types/finance.types';
import type {PaymentRecord} from '@/types/loan.types';
import {
  buildSubscriptionDetailReadModel,
  getVisibleSubscriptionPayments,
  parsePaymentAmount,
  resolveSubscriptionId,
} from './subscriptionDetailReadModels';

const createPayment = (id: string, date: string, amount = 10): PaymentRecord => ({
  id,
  amount,
  date,
  method: 'manual',
  status: 'PAID',
  principalPaid: 0,
  interestPaid: 0,
  createdAt: `${date}T00:00:00.000Z`,
});

const createSubscription = (overrides: Partial<SubscriptionData> = {}): SubscriptionData => ({
  id: 'subscription-1',
  name: 'Streaming',
  amount: 20,
  billingCycle: 'monthly',
  nextBilling: '2026-07-15',
  category: 'Entertainment',
  icon: 'tv',
  color: '#E50914',
  status: 'active',
  website: 'https://example.com/account',
  autoPayEnabled: true,
  reminderEnabled: true,
  reminderDaysBefore: 3,
  paymentHistory: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('subscriptionDetailReadModels', () => {
  it('resolves the primary route id before the legacy subscription id', () => {
    expect(resolveSubscriptionId({id: ['subscription-1'], subscriptionId: 'legacy-id'})).toBe(
      'subscription-1',
    );
    expect(resolveSubscriptionId({subscriptionId: 'legacy-id'})).toBe('legacy-id');
    expect(resolveSubscriptionId({})).toBe('');
  });

  it.each([
    ['12', 12],
    ['12.50', 12.5],
    ['', null],
    ['0', null],
    ['invalid', null],
  ])('parses payment amount %p as %p', (input, expected) => {
    expect(parsePaymentAmount(input)).toBe(expected);
  });

  it('builds status and detail labels used by the subscription sections', () => {
    expect(buildSubscriptionDetailReadModel(createSubscription())).toEqual({
      statusColor: '#4ADE80',
      nextBillingLabel: new Date('2026-07-15').toLocaleDateString(),
      autoPayLabel: 'Enabled',
      autoPayColor: '#4ADE80',
      reminderLabel: '3 days before',
      reminderColor: '#EC4899',
      websiteLabel: 'example.com/account',
    });
  });

  it('returns newest payments first without mutating the subscription history', () => {
    const oldest = createPayment('oldest', '2026-01-01');
    const newest = createPayment('newest', '2026-03-01');
    const middle = createPayment('middle', '2026-02-01');
    const history = [oldest, newest, middle];

    expect(getVisibleSubscriptionPayments(history, false).map(({id}) => id)).toEqual([
      'newest',
      'middle',
      'oldest',
    ]);
    expect(history.map(({id}) => id)).toEqual(['oldest', 'newest', 'middle']);
  });

  it('sorts only the stored first three payments when history is collapsed', () => {
    const history = [
      createPayment('first', '2026-01-01'),
      createPayment('fourth', '2026-04-01'),
      createPayment('second', '2026-02-01'),
      createPayment('third', '2026-03-01'),
    ];

    expect(getVisibleSubscriptionPayments(history, false).map(({id}) => id)).toEqual([
      'fourth',
      'second',
      'first',
    ]);
    expect(getVisibleSubscriptionPayments(history, true)).toHaveLength(4);
  });
});
