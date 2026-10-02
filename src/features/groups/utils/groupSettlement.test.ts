import {Transaction} from '../../../types';
import {EnhancedGroupMember} from '@/features/groups/types';
import {
  applyDirectSettlement,
  buildSettlementTransaction,
  getSettledDebtAmountTotal,
} from './groupSettlement';

const makeMember = (id: string, name: string): EnhancedGroupMember => ({
  id,
  name,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  balance: 0,
  totalPaid: 0,
  totalOwed: 0,
  joinedAt: new Date('2026-01-01T00:00:00.000Z'),
  isActive: true,
  role: 'member',
  permissions: {
    canAddExpenses: true,
    canEditExpenses: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canEditGroup: false,
  },
});

const makeExpense = (id: string, amount: number, settledAmount = 0): Transaction => ({
  id,
  amount,
  category: 'Food',
  description: id,
  date: '2026-01-01',
  type: 'expense',
  paidBy: 'creditor',
  splitDetails: [
    {
      memberId: 'debtor',
      memberName: 'Debtor',
      amount,
      isPaid: false,
      settledAmount,
    },
  ],
});

describe('groupSettlement utilities', () => {
  it('applies a direct settlement across outstanding expense splits in order', () => {
    const result = applyDirectSettlement(
      {fromMemberId: 'debtor', toMemberId: 'creditor', amount: 75},
      [makeExpense('exp-1', 60), makeExpense('exp-2', 50)],
    );

    expect(result.settledAmount).toBe(75);
    expect(result.remainingAmount).toBe(0);
    expect(result.settledExpenseIds).toEqual(['exp-1', 'exp-2']);
    expect(result.settledDebtAmounts).toEqual({'exp-1': 60, 'exp-2': 15});
    expect(result.updatedTransactions[0].splitDetails?.[0]).toEqual(
      expect.objectContaining({isPaid: true, settledAmount: 60}),
    );
    expect(result.updatedTransactions[1].splitDetails?.[0]).toEqual(
      expect.objectContaining({isPaid: false, settledAmount: 15}),
    );
  });

  it('ignores transactions that are not direct unpaid debts to the receiver', () => {
    const unrelatedExpense = {
      ...makeExpense('exp-1', 60),
      paidBy: 'someone-else',
    };

    const result = applyDirectSettlement(
      {fromMemberId: 'debtor', toMemberId: 'creditor', amount: 60},
      [unrelatedExpense],
    );

    expect(result.settledAmount).toBe(0);
    expect(result.remainingAmount).toBe(60);
    expect(result.settledExpenseIds).toEqual([]);
    expect(result.settledDebtAmounts).toEqual({});
    expect(result.updatedTransactions).toEqual([unrelatedExpense]);
  });

  it('builds settlement transaction metadata from applied settlement amounts', () => {
    const now = new Date('2026-02-03T04:05:06.000Z');
    const transaction = buildSettlementTransaction({
      id: 'settlement-1',
      groupId: 'group-1',
      settlement: {
        fromMemberId: 'debtor',
        toMemberId: 'creditor',
        amount: 75,
      },
      fromMember: makeMember('debtor', 'Debtor'),
      toMember: makeMember('creditor', 'Creditor'),
      settledExpenseIds: ['exp-1', 'exp-2'],
      settledDebtAmounts: {'exp-1': 60, 'exp-2': 15},
      now,
    });

    expect(transaction).toEqual(
      expect.objectContaining({
        id: 'settlement-1',
        amount: 75,
        category: 'Settlement',
        description: 'Settlement from Debtor to Creditor',
        date: now.toISOString(),
        type: 'income',
        groupId: 'group-1',
        paidBy: 'debtor',
        receivedBy: ['creditor'],
        isSettlement: true,
        settledDebts: ['exp-1', 'exp-2'],
        settledDebtAmounts: {'exp-1': 60, 'exp-2': 15},
      }),
    );
    expect(getSettledDebtAmountTotal(transaction.settledDebtAmounts || {})).toBe(75);
  });
});
