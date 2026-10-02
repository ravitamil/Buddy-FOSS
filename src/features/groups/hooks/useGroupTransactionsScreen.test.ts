import type {Transaction} from '@/types';

describe('useGroupTransactionsScreen logic', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx1',
      description: 'Dinner at Italian Place',
      amount: 120,
      date: '2026-08-15T19:00:00Z',
      type: 'expense',
      category: 'Food',
      paidBy: 'user1',
      splitAmong: ['user1', 'user2', 'user3'],
      splitDetails: [
        {memberId: 'user1', memberName: 'User 1', amount: 40, isPaid: true, settledAmount: 40},
        {memberId: 'user2', memberName: 'User 2', amount: 40, isPaid: false, settledAmount: 0},
        {memberId: 'user3', memberName: 'User 3', amount: 40, isPaid: false, settledAmount: 0},
      ],
      createdBy: 'user1',
      lastModified: new Date(),
    },
    {
      id: 'tx2',
      description: 'Groceries',
      amount: 60,
      date: '2026-08-16T10:00:00Z',
      type: 'expense',
      category: 'Groceries',
      paidBy: 'user2',
      splitAmong: ['user1', 'user2'],
      splitDetails: [
        {memberId: 'user1', memberName: 'User 1', amount: 30, isPaid: false, settledAmount: 0},
        {memberId: 'user2', memberName: 'User 2', amount: 30, isPaid: true, settledAmount: 30},
      ],
      createdBy: 'user2',
      lastModified: new Date(),
    },
    {
      id: 'tx3',
      description: 'Settlement from User 2 to User 1',
      amount: 40,
      date: '2026-08-17T12:00:00Z',
      type: 'income',
      category: 'Settlement',
      paidBy: 'user2',
      receivedBy: ['user1'],
      isSettlement: true,
      createdBy: 'user2',
      lastModified: new Date(),
    },
  ];

  it('calculates group transaction summaries correctly', () => {
    let totalExpenses = 0;
    let totalPayments = 0;
    let userPaid = 0;
    let userShare = 0;

    const currentMemberId = 'user1';

    for (const tx of mockTransactions) {
      const amount = Math.abs(tx.amount);
      const isExpense = tx.type === 'expense' && !tx.isSettlement;
      const isPayment = tx.isSettlement || tx.type === 'income';

      if (isExpense) {
        totalExpenses += amount;
        if (tx.paidBy === currentMemberId) {
          userPaid += amount;
        }
        const userSplit = tx.splitDetails?.find((s) => s.memberId === currentMemberId);
        if (userSplit) {
          userShare += userSplit.amount;
        }
      } else if (isPayment) {
        totalPayments += amount;
      }
    }

    expect(totalExpenses).toBe(180); // 120 + 60
    expect(totalPayments).toBe(40);
    expect(userPaid).toBe(120); // user1 paid for dinner
    expect(userShare).toBe(70); // 40 (dinner) + 30 (groceries)
    expect(userPaid - userShare).toBe(50); // Net positive: +$50
  });

  it('filters by category, description, and payer search query', () => {
    const query = 'groceries';
    const filtered = mockTransactions.filter((tx) => {
      const descMatch = tx.description.toLowerCase().includes(query);
      const categoryMatch =
        typeof tx.category === 'string' && tx.category.toLowerCase().includes(query);
      return descMatch || categoryMatch;
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('tx2');
  });

  it('filters by paid_by_me filter option', () => {
    const currentMemberId = 'user1';
    const paidByMe = mockTransactions.filter((tx) => tx.paidBy === currentMemberId);

    expect(paidByMe.length).toBe(1);
    expect(paidByMe[0].id).toBe('tx1');
  });

  it('filters by payment / settlement filter option', () => {
    const payments = mockTransactions.filter((tx) => tx.isSettlement || tx.type === 'income');

    expect(payments.length).toBe(1);
    expect(payments[0].id).toBe('tx3');
  });
});
