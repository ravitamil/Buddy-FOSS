import type {Category, Transaction} from '@/types';
import {
  createAnalyticsData,
  createTransactionItem,
  filterAndSortTransactions,
  getPageTitle,
  groupTransactions,
  summarizeTransactions,
} from './transactionsScreenModelUtils';

const categories = [
  {id: 'food', name: 'Food', type: 'expense', icon: 'fast-food', color: '#111111'},
  {id: 'salary', name: 'Salary', type: 'income', icon: 'cash', color: '#222222'},
] as Category[];

const transactions = [
  {
    id: 'expense-1',
    description: 'Lunch',
    amount: -25,
    type: 'expense',
    category: 'food',
    date: '2026-01-02',
    groupId: 'group-1',
  },
  {
    id: 'income-1',
    description: 'Paycheck',
    amount: 100,
    type: 'income',
    category: 'salary',
    date: '2026-01-03',
  },
] as Transaction[];

describe('transactionsScreenModelUtils', () => {
  it('filters by type, group, and search text then sorts by date', () => {
    const result = filterAndSortTransactions({
      transactions,
      categories,
      groupById: new Map([['group-1', {id: 'group-1', name: 'Trip'} as never]]),
      formatCurrency: (amount) => `$${amount}`,
      searchText: 'trip',
      selectedType: 'expense',
      selectedCategory: 'all',
      selectedGroups: ['group-1'],
      showNoGroups: false,
      sortBy: 'date-desc',
    });

    expect(result.map((transaction) => transaction.id)).toEqual(['expense-1']);
  });

  it('groups transactions and summarizes totals', () => {
    expect(
      groupTransactions({
        transactions,
        groupBy: 'type',
        groupById: new Map(),
      }).map((group) => group.title),
    ).toEqual(['Expense', 'Income']);

    expect(summarizeTransactions(transactions)).toEqual({
      totalIncome: 100,
      totalExpenses: 25,
      netAmount: 75,
    });
  });

  it('creates expense analytics by category', () => {
    expect(createAnalyticsData(transactions, categories)).toEqual([
      {
        value: 25,
        color: '#111111',
        label: 'Food',
        text: '100.0%',
      },
    ]);
  });

  it('creates context-aware settlement items with group metadata', () => {
    const group = {
      id: 'group-1',
      name: 'Trip',
      emoji: '✈️',
      members: [
        {id: 'payer', name: 'Vimal Cse'},
        {id: 'receiver', name: 'Ravitamil', supabaseUserId: 'auth-user'},
      ],
    } as never;

    const item = createTransactionItem({
      transaction: {
        id: 'settlement-1',
        description: 'Settlement from Vimal Cse to Ravitamil',
        amount: 50,
        type: 'income',
        category: 'Settlement',
        date: '2026-01-04',
        groupId: 'group-1',
        paidBy: 'payer',
        receivedBy: ['receiver'],
        isSettlement: true,
      },
      categories,
      groupById: new Map([['group-1', group]]),
      currentUserId: 'auth-user',
      currentUserName: 'Ravitamil',
    });

    expect(item).toMatchObject({
      description: 'Repayment from Vimal Cse',
      groupName: 'Trip',
      groupEmoji: '✈️',
      settlementStatus: 'settled',
      category: {name: 'Settlement', icon: 'swap-horizontal'},
    });
  });

  it('derives partial group expense status for the signed-in member', () => {
    const group = {
      id: 'group-1',
      name: 'Trip',
      emoji: '✈️',
      members: [{id: 'member-user', name: 'Ravitamil', supabaseUserId: 'auth-user'}],
    } as never;

    const item = createTransactionItem({
      transaction: {
        ...transactions[0],
        paidBy: 'payer',
        splitDetails: [
          {
            memberId: 'member-user',
            memberName: 'Ravitamil',
            amount: 25,
            settledAmount: 10,
            isPaid: false,
          },
        ],
      },
      categories,
      groupById: new Map([['group-1', group]]),
      currentUserId: 'auth-user',
    });

    expect(item.settlementStatus).toBe('partial');
    expect(item.category.icon).toBe('fast-food');
  });

  it('consistently returns "Transactions" as page title', () => {
    expect(getPageTitle()).toBe('Transactions');
  });
});
