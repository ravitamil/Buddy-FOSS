import {createGroupDetailTransactionItem} from './groupDetailScreenModels';
import type {Category, Transaction} from '@/types';
import type {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';

describe('createGroupDetailTransactionItem', () => {
  const members: EnhancedGroupMember[] = [
    {
      id: 'member-user',
      name: 'Ravitamil',
      role: 'creator',
      joinedAt: new Date(),
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      isActive: true,
      permissions: {
        canAddMembers: true,
        canRemoveMembers: true,
        canEditGroup: true,
        canDeleteGroup: true,
      },
    },
    {
      id: 'member-punith',
      name: 'Punithavel',
      role: 'member',
      joinedAt: new Date(),
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      isActive: true,
      permissions: {
        canAddMembers: false,
        canRemoveMembers: false,
        canEditGroup: false,
        canDeleteGroup: false,
      },
    },
    {
      id: 'member-vimal',
      name: 'Vimal',
      role: 'member',
      joinedAt: new Date(),
      balance: 0,
      totalPaid: 0,
      totalOwed: 0,
      isActive: true,
      permissions: {
        canAddMembers: false,
        canRemoveMembers: false,
        canEditGroup: false,
        canDeleteGroup: false,
      },
    },
  ];

  const group: EnhancedGroup = {
    id: 'test-group',
    name: 'Trip',
    currency: 'INR',
    creatorId: 'member-user',
    members,
    transactions: [],
    categories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivity: new Date(),
    settings: {
      allowMemberInvites: true,
      requireApprovalForExpenses: false,
      defaultSplitType: 'equal',
      simplifyDebts: true,
    },
  };

  const categories: Category[] = [
    {
      id: 'cat-food',
      name: 'Food',
      icon: 'restaurant-outline',
      color: '#F59E0B',
      type: 'expense',
      isSystem: true,
    },
  ];

  const currentUser = members[0];

  it('correctly calculates user lent amount when current user paid an expense', () => {
    const expenseTx: Transaction = {
      id: 'tx-tea',
      amount: -90,
      description: 'Tea & Snacks',
      category: 'Food',
      categoryId: 'cat-food',
      date: '2026-09-02T10:00:00.000Z',
      type: 'expense',
      paidBy: 'member-user',
      splitAmong: ['member-user', 'member-punith', 'member-vimal'],
      splitDetails: [
        {memberId: 'member-user', amount: 30, isPaid: true},
        {memberId: 'member-punith', amount: 30, isPaid: false},
        {memberId: 'member-vimal', amount: 30, isPaid: false},
      ],
    };

    const item = createGroupDetailTransactionItem({
      transaction: expenseTx,
      group,
      currentUserMember: currentUser,
      categories,
      isDarkMode: true,
    });

    expect(item.impactType).toBe('lent');
    expect(item.impactLabel).toBe('you lent');
    expect(item.totalAmount).toBe(90);
    expect(item.netAmount).toBe(60); // 90 total - 30 userShare = 60 lent
    expect(item.description).toBe('Tea & Snacks');
    expect(item.subtitle).toContain('Food • You paid •');
  });

  it('correctly calculates user owed amount when someone else paid an expense', () => {
    const expenseTx: Transaction = {
      id: 'tx-lunch',
      amount: -150,
      description: 'Lunch',
      category: 'Food',
      categoryId: 'cat-food',
      date: '2026-09-02T13:00:00.000Z',
      type: 'expense',
      paidBy: 'member-punith',
      splitAmong: ['member-user', 'member-punith', 'member-vimal'],
      splitDetails: [
        {memberId: 'member-user', amount: 50, isPaid: false},
        {memberId: 'member-punith', amount: 50, isPaid: true},
        {memberId: 'member-vimal', amount: 50, isPaid: false},
      ],
    };

    const item = createGroupDetailTransactionItem({
      transaction: expenseTx,
      group,
      currentUserMember: currentUser,
      categories,
      isDarkMode: true,
    });

    expect(item.impactType).toBe('borrowed');
    expect(item.impactLabel).toBe('you owe');
    expect(item.totalAmount).toBe(150);
    expect(item.netAmount).toBe(-50);
    expect(item.subtitle).toContain('Food • Punithavel paid •');
  });

  it('identifies not involved when user is not part of the split', () => {
    const expenseTx: Transaction = {
      id: 'tx-cab',
      amount: -40,
      description: 'Cab',
      category: 'Transport',
      date: '2026-09-02T15:00:00.000Z',
      type: 'expense',
      paidBy: 'member-punith',
      splitAmong: ['member-punith', 'member-vimal'],
      splitDetails: [
        {memberId: 'member-punith', amount: 20, isPaid: true},
        {memberId: 'member-vimal', amount: 20, isPaid: false},
      ],
    };

    const item = createGroupDetailTransactionItem({
      transaction: expenseTx,
      group,
      currentUserMember: currentUser,
      categories,
      isDarkMode: true,
    });

    expect(item.impactType).toBe('neutral');
    expect(item.impactLabel).toBe('not involved');
    expect(item.netAmount).toBe(0);
  });

  it('correctly handles received settlement', () => {
    const settlementTx: Transaction = {
      id: 'tx-settle-1',
      amount: 30,
      description: 'Repayment from Punithavel to Ravitamil',
      category: 'Settlement',
      date: '2026-09-02T16:00:00.000Z',
      type: 'income',
      isSettlement: true,
      paidBy: 'member-punith',
      receivedBy: ['member-user'],
    };

    const item = createGroupDetailTransactionItem({
      transaction: settlementTx,
      group,
      currentUserMember: currentUser,
      categories,
      isDarkMode: true,
    });

    expect(item.isSettlement).toBe(true);
    expect(item.impactType).toBe('received');
    expect(item.impactLabel).toBe('you received');
    expect(item.netAmount).toBe(30);
    expect(item.description).toBe('Payment from Punithavel');
    expect(item.subtitle).toContain('Settlement •');
  });

  it('correctly handles paid settlement', () => {
    const settlementTx: Transaction = {
      id: 'tx-settle-2',
      amount: 50,
      description: 'Repayment from Ravitamil to Vimal',
      category: 'Settlement',
      date: '2026-09-02T17:00:00.000Z',
      type: 'income',
      isSettlement: true,
      paidBy: 'member-user',
      receivedBy: ['member-vimal'],
    };

    const item = createGroupDetailTransactionItem({
      transaction: settlementTx,
      group,
      currentUserMember: currentUser,
      categories,
      isDarkMode: true,
    });

    expect(item.isSettlement).toBe(true);
    expect(item.impactType).toBe('paid');
    expect(item.impactLabel).toBe('you paid');
    expect(item.netAmount).toBe(-50);
    expect(item.description).toBe('Payment to Vimal');
  });

  it('correctly handles settlement between other group members', () => {
    const settlementTx: Transaction = {
      id: 'tx-settle-3',
      amount: 25,
      description: 'Repayment from Punithavel to Vimal',
      category: 'Settlement',
      date: '2026-09-02T18:00:00.000Z',
      type: 'income',
      isSettlement: true,
      paidBy: 'member-punith',
      receivedBy: ['member-vimal'],
    };

    const item = createGroupDetailTransactionItem({
      transaction: settlementTx,
      group,
      currentUserMember: currentUser,
      categories,
      isDarkMode: true,
    });

    expect(item.isSettlement).toBe(true);
    expect(item.impactType).toBe('neutral');
    expect(item.impactLabel).toBe('settled');
    expect(item.description).toBe('Punithavel → Vimal');
  });
});
