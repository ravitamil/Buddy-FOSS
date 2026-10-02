import {transactionDatabaseService} from './TransactionDatabaseService';
import {Transaction} from '../types';

describe('TransactionDatabaseService settlement metadata', () => {
  it('persists and restores settlement metadata when saving transactions locally', async () => {
    const transaction: Transaction = {
      id: 'tx-settle-1',
      amount: 90,
      description: 'Settlement for dinner',
      category: 'Settlement',
      categoryId: undefined,
      date: '2026-01-01T10:00:00.000Z',
      type: 'expense',
      groupId: 'group-1',
      paidBy: 'member-a',
      receivedBy: ['member-b'],
      splitMethod: 'custom',
      splitAmong: ['member-a', 'member-b'],
      splitAmounts: {'member-a': -90, 'member-b': 90},
      splitDetails: [
        {
          memberId: 'member-a',
          memberName: 'A',
          amount: -90,
          isPaid: true,
          settledAmount: 90,
          settledDate: new Date('2026-01-01T10:00:00.000Z'),
        },
        {
          memberId: 'member-b',
          memberName: 'B',
          amount: 90,
          isPaid: true,
          settledAmount: 90,
          settledDate: new Date('2026-01-01T10:00:00.000Z'),
        },
      ],
      isSettlement: true,
      settledDebts: ['exp-1'],
      settledDebtAmounts: {'exp-1': 90},
      transactionCurrency: 'USD',
      fxRateApplied: 1,
      lastModified: new Date('2026-01-01T10:00:00.000Z'),
    };

    await transactionDatabaseService.saveTransactions('user-1', [transaction]);

    const list = await transactionDatabaseService.getTransactions('user-1', {groupId: 'group-1'});
    expect(list.some((tx) => tx.id === 'tx-settle-1')).toBe(true);

    const saved = list.find((tx) => tx.id === 'tx-settle-1')!;
    expect(saved.isSettlement).toBe(true);
    expect(saved.settledDebts).toEqual(['exp-1']);
    expect(saved.settledDebtAmounts).toEqual({'exp-1': 90});
    expect(saved.splitDetails).toHaveLength(2);
  });

  it('restores settlement metadata and dates when mapping rows back to app transactions', () => {
    const row = {
      id: 'tx-2',
      user_id: 'user-2',
      amount: 75,
      description: 'Direct settlement',
      date: '2026-01-02T10:00:00.000Z',
      type: 'expense' as const,
      group_id: 'group-2',
      paid_by: 'member-c',
      received_by: ['member-d'],
      split_method: 'custom' as const,
      split_among: ['member-c', 'member-d'],
      split_amounts: {'member-c': -75, 'member-d': 75},
      split_details: [
        {
          memberId: 'member-c',
          memberName: 'C',
          amount: -75,
          settledDate: '2026-01-02T10:00:00.000Z',
        },
      ],
      is_settlement: true,
      settled_debts: ['exp-2'],
      settled_debt_amounts: {'exp-2': 75},
      transaction_currency: 'EUR',
      fx_rate_applied: 1.1,
      updated_at: '2026-01-02T10:00:00.000Z',
      categories: null,
    };

    const mapped = transactionDatabaseService.mapTransaction(row);

    expect(mapped.category).toBe('Settlement');
    expect(mapped.isSettlement).toBe(true);
    expect(mapped.settledDebts).toEqual(['exp-2']);
    expect(mapped.settledDebtAmounts).toEqual({'exp-2': 75});
    expect(mapped.transactionCurrency).toBe('EUR');
    expect(mapped.fxRateApplied).toBe(1.1);
    expect(mapped.splitDetails?.[0]?.settledDate).toBeInstanceOf(Date);
  });

  it('prunes stale remote group transactions from local storage', async () => {
    const tx1: Transaction = {
      id: 'keep-1',
      groupId: 'group-9',
      amount: 10,
      description: 'Keep',
      date: '2026-01-01',
      type: 'expense',
      category: 'General',
    };
    const tx2: Transaction = {
      id: 'stale-1',
      groupId: 'group-9',
      amount: 20,
      description: 'Stale',
      date: '2026-01-01',
      type: 'expense',
      category: 'General',
    };
    await transactionDatabaseService.saveTransactions('user-2', [tx1, tx2]);

    await transactionDatabaseService.pruneGroupTransactions('user-2', 'group-9', ['keep-1']);

    const remaining = await transactionDatabaseService.getTransactions('user-2', {
      groupId: 'group-9',
    });
    expect(remaining.map((t) => t.id)).toEqual(['keep-1']);
  });
});
