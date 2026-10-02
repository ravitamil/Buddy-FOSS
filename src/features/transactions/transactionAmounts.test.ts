import type {Transaction} from '@/types';
import {getUserTransactionAmount, getUserTransactionAmountForType} from './transactionAmounts';

const transaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'transaction-id',
  amount: -120,
  category: 'Food',
  description: 'Dinner',
  date: '2026-09-03T12:00:00.000Z',
  type: 'expense',
  ...overrides,
});

describe('transaction amount semantics', () => {
  it('uses the signed-in user split for group transactions', () => {
    const groupExpense = transaction({
      groupId: 'group-id',
      splitAmounts: {'user-1': 40, 'user-2': 80},
    });

    expect(getUserTransactionAmount(groupExpense, 'user-1')).toBe(40);
    expect(getUserTransactionAmount(groupExpense, 'user-2')).toBe(80);
  });

  it('does not assign another member explicit split to the signed-in user', () => {
    const groupExpense = transaction({
      groupId: 'group-id',
      splitDetails: [{memberId: 'user-2', memberName: 'Other', amount: 120}],
    });

    expect(getUserTransactionAmount(groupExpense, 'user-1')).toBe(0);
  });

  it('excludes settlements from income and expense totals', () => {
    const settlement = transaction({isSettlement: true});

    expect(getUserTransactionAmount(settlement, 'user-1')).toBe(0);
    expect(getUserTransactionAmountForType(settlement, 'expense', 'user-1')).toBe(0);
  });

  it('returns zero when the requested transaction type does not match', () => {
    expect(getUserTransactionAmountForType(transaction(), 'income', 'user-1')).toBe(0);
  });
});
