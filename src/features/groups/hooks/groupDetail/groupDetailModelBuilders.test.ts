import type {Transaction} from '@/types';
import {createSubtitle, filterTopTransactions} from './groupDetailModelBuilders';
import type {GroupDetailBalanceViewModel, GroupDetailStats} from '../../types/groupDetailScreen';

const baseStats: GroupDetailStats = {
  totalExpenses: 0,
  totalPayments: 0,
  totalAmount: 0,
  totalReceived: 0,
  perPersonShare: 0,
  memberCount: 2,
  transactionCount: 0,
  memberBalances: [],
  topExpenseCategories: [],
  monthlyTrends: [],
  settlementSuggestions: [],
  currentUserBalance: 0,
  debtMatrix: {},
  lastActivityDate: new Date('2026-01-01T00:00:00.000Z'),
};

const baseBalance: GroupDetailBalanceViewModel = {
  oweAmount: 0,
  owedAmount: 0,
  totalPaidByCurrentUser: 0,
  currentUserShare: 0,
  isActuallySettled: false,
  isPositive: false,
  isBalanced: false,
  shouldShowSettleCta: false,
};

describe('groupDetailModelBuilders', () => {
  it('filters top transactions by current user share', () => {
    const transactions = [
      {id: 'older', date: '2026-01-01', paidBy: 'member-2'} as Transaction,
      {
        id: 'split',
        date: '2026-01-03',
        paidBy: 'member-2',
        splitDetails: [{memberId: 'member-1', amount: 10}],
      } as Transaction,
      {id: 'paid', date: '2026-01-02', paidBy: 'member-1'} as Transaction,
    ];

    expect(
      filterTopTransactions(transactions, 'my_share', 'member-1').map((item) => item.id),
    ).toEqual(['split', 'paid']);
  });

  it('creates balance-aware subtitles', () => {
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    expect(
      createSubtitle(
        {...baseStats, memberBalances: [{} as GroupDetailStats['memberBalances'][number]]},
        {...baseBalance, isPositive: true},
        formatCurrency,
      ),
    ).toBe("You're owed $0.00");
  });
});
