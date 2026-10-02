import type {Group, GroupMember, Transaction} from '../types';
import type {GroupBalanceCalculation} from '../utils/groupBalanceUtils.optimized';
import type {
  GroupPerformanceMetrics,
  MemberActivityResult,
  TransactionFilterResult,
  TransactionFilters,
} from './groupPerformanceTypes';

export function createBalanceDependencyHash(
  transactions: Transaction[],
  members: GroupMember[],
): [string, string] {
  return [
    JSON.stringify(
      transactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        date: transaction.date,
        paidBy: transaction.paidBy,
        splitAmounts: transaction.splitAmounts,
      })),
    ),
    JSON.stringify(members.map((member) => ({id: member.id, name: member.name}))),
  ];
}

export function createTransactionFilterDependencyHash(
  transactions: Transaction[],
  filters: TransactionFilters,
): [string, string] {
  return [
    JSON.stringify(filters),
    JSON.stringify(
      transactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        paidBy: transaction.paidBy,
        type: transaction.type,
      })),
    ),
  ];
}

export function createMemberActivityDependencyHash(transactions: Transaction[]): string {
  return JSON.stringify(
    transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      date: transaction.date,
      paidBy: transaction.paidBy,
    })),
  );
}

export function createGroupStatsDependencyHash(group: Group | null): string {
  return JSON.stringify(
    (group?.transactions || []).map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
    })),
  );
}

export function summarizeSettlementSuggestions(
  suggestions: GroupBalanceCalculation['settlementSuggestions'],
) {
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    return b.amount - a.amount;
  });

  return {
    suggestions: sortedSuggestions,
    totalSuggestions: sortedSuggestions.length,
    totalAmount: sortedSuggestions.reduce((sum, suggestion) => sum + suggestion.amount, 0),
    isSettled: sortedSuggestions.length === 0,
  };
}

export function calculateGroupStats(group: Group | null) {
  if (!group) {
    return {
      totalTransactions: 0,
      totalMembers: 0,
      totalExpenses: 0,
      totalPayments: 0,
      netBalance: 0,
      averageExpensePerTransaction: 0,
      averageExpensePerMember: 0,
      latestTransaction: null,
      oldestTransaction: null,
      recentActivityCount: 0,
      groupAge: 0,
      isActive: false,
      activityScore: 0,
      balanceHealth: 'balanced' as const,
      topSpenders: [],
      topCategories: [],
      monthlyTrends: [],
      settlementSuggestions: [],
    };
  }

  const transactions = group.transactions || [];
  const members = group.members || [];
  const totalTransactions = transactions.length;
  const totalMembers = members.length;
  const expenses = transactions.filter((transaction) => isExpense(transaction));
  const payments = transactions.filter((transaction) => isPayment(transaction));
  const totalExpenses = expenses.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount),
    0,
  );
  const totalPayments = payments.reduce((sum, transaction) => sum + transaction.amount, 0);
  const netBalance = totalPayments - totalExpenses;
  const sortedTransactions = [...transactions].sort(compareTransactionsByNewestDate);
  const latestTransaction = sortedTransactions[0] || null;
  const oldestTransaction = sortedTransactions[sortedTransactions.length - 1] || null;
  const thirtyDaysAgo = getThirtyDaysAgo();
  const recentTransactions = transactions.filter(
    (transaction) => new Date(transaction.date) >= thirtyDaysAgo,
  );
  const recentExpenses = recentTransactions.filter((transaction) => isExpense(transaction));
  const recentExpenseAmount = recentExpenses.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount),
    0,
  );

  return {
    totalTransactions,
    totalMembers,
    totalExpenses,
    totalPayments,
    netBalance,
    averageExpensePerTransaction: expenses.length > 0 ? totalExpenses / expenses.length : 0,
    averageExpensePerMember: totalMembers > 0 ? totalExpenses / totalMembers : 0,
    recentTransactionCount: recentTransactions.length,
    recentExpenseCount: recentExpenses.length,
    recentExpenseAmount,
    latestTransaction,
    oldestTransaction,
    latestTransactionDate: latestTransaction ? new Date(latestTransaction.date) : null,
    oldestTransactionDate: oldestTransaction ? new Date(oldestTransaction.date) : null,
    hasTransactions: totalTransactions > 0,
    hasExpenses: expenses.length > 0,
    hasPayments: payments.length > 0,
    isActive: recentTransactions.length > 0,
  };
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters = {},
): TransactionFilterResult {
  let filtered = [...transactions];

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter((transaction) => transaction.type === filters.type);
  }

  if (filters.memberId) {
    const memberId = filters.memberId;
    filtered = filtered.filter((transaction) => isMemberInTransaction(transaction, memberId));
  }

  if (filters.dateRange) {
    const {start, end} = filters.dateRange;
    filtered = filtered.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }

  if (filters.amountRange) {
    const {min, max} = filters.amountRange;
    filtered = filtered.filter((transaction) => {
      const amount = Math.abs(transaction.amount);
      return amount >= min && amount <= max;
    });
  }

  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchLower = filters.searchTerm.toLowerCase().trim();
    filtered = filtered.filter((transaction) => {
      return (
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.category?.toLowerCase().includes(searchLower) ||
        transaction.notes?.toLowerCase().includes(searchLower)
      );
    });
  }

  filtered.sort(compareTransactionsByNewestDate);

  return {
    transactions: filtered,
    count: filtered.length,
    totalAmount: filtered.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    hasResults: filtered.length > 0,
  };
}

export function calculateMemberActivity(
  memberId: string,
  transactions: Transaction[],
  members: GroupMember[],
): MemberActivityResult | null {
  const member = members.find((candidate) => candidate.id === memberId);
  if (!member) return null;

  const paidTransactions = transactions.filter((transaction) => transaction.paidBy === memberId);
  const totalPaid = paidTransactions.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount),
    0,
  );
  const involvedTransactions = transactions.filter((transaction) =>
    isMemberInSplit(transaction, memberId),
  );
  const totalOwed = involvedTransactions.reduce(
    (sum, transaction) => sum + getMemberShare(transaction, memberId),
    0,
  );
  const balance = totalPaid - totalOwed;
  const lastPaidTransaction = [...paidTransactions].sort(compareTransactionsByNewestDate)[0];
  const lastInvolvedTransaction = [...involvedTransactions].sort(
    compareTransactionsByNewestDate,
  )[0];
  const thirtyDaysAgo = getThirtyDaysAgo();
  const recentPaidTransactions = paidTransactions.filter(
    (transaction) => new Date(transaction.date) >= thirtyDaysAgo,
  );
  const recentInvolvedTransactions = involvedTransactions.filter(
    (transaction) => new Date(transaction.date) >= thirtyDaysAgo,
  );

  return {
    member,
    totalPaid,
    totalOwed,
    balance,
    paidTransactionCount: paidTransactions.length,
    involvedTransactionCount: involvedTransactions.length,
    totalTransactionCount: new Set([
      ...paidTransactions.map((transaction) => transaction.id),
      ...involvedTransactions.map((transaction) => transaction.id),
    ]).size,
    recentPaidCount: recentPaidTransactions.length,
    recentInvolvedCount: recentInvolvedTransactions.length,
    recentPaidAmount: recentPaidTransactions.reduce(
      (sum, transaction) => sum + Math.abs(transaction.amount),
      0,
    ),
    lastPaidDate: lastPaidTransaction ? new Date(lastPaidTransaction.date) : null,
    lastInvolvedDate: lastInvolvedTransaction ? new Date(lastInvolvedTransaction.date) : null,
    isActive: recentPaidTransactions.length > 0 || recentInvolvedTransactions.length > 0,
    hasBalance: Math.abs(balance) > 1,
    owes: balance < -1,
    isOwed: balance > 1,
  };
}

export function calculateGroupPerformanceMetrics(group: Group): GroupPerformanceMetrics {
  const transactionCount = group.transactions?.length || 0;
  const memberCount = group.members?.length || 0;
  const complexityScore = transactionCount * memberCount + transactionCount * 2;
  const recommendations: string[] = [];

  if (transactionCount > 100) {
    recommendations.push('Consider archiving old transactions');
  }

  if (memberCount > 20) {
    recommendations.push('Large groups may benefit from sub-groups');
  }

  if (complexityScore > 1000) {
    recommendations.push('Group calculations may be slow - consider optimizations');
  }

  return {
    transactionCount,
    memberCount,
    complexityScore,
    recommendations,
    isLargeGroup: memberCount > 10,
    hasManyTransactions: transactionCount > 50,
    needsOptimization: complexityScore > 500,
  };
}

function isExpense(transaction: Transaction): boolean {
  return transaction.type === 'expense' && transaction.amount < 0;
}

function isPayment(transaction: Transaction): boolean {
  return transaction.type === 'income' && transaction.amount > 0;
}

function compareTransactionsByNewestDate(a: Transaction, b: Transaction): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function getThirtyDaysAgo(): Date {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return thirtyDaysAgo;
}

function isMemberInTransaction(transaction: Transaction, memberId: string): boolean {
  return transaction.paidBy === memberId || isMemberInSplit(transaction, memberId);
}

function isMemberInSplit(transaction: Transaction, memberId: string): boolean {
  if (transaction.splitAmong?.includes(memberId)) return true;
  if (transaction.splitAmounts && memberId in transaction.splitAmounts) return true;
  return false;
}

function getMemberShare(transaction: Transaction, memberId: string): number {
  if (transaction.splitAmounts && memberId in transaction.splitAmounts) {
    return transaction.splitAmounts[memberId];
  }

  if (transaction.splitAmong?.includes(memberId)) {
    return Math.abs(transaction.amount) / transaction.splitAmong.length;
  }

  return 0;
}
