import {GroupMember, MemberDebt, Transaction} from '../types';
import {logger as appLogger} from '../services/LoggerService';
import {PerformanceMonitor} from './groupBalancePerformance';
import {GroupBalanceCalculation, MemberBalance, PerformanceMetrics} from './groupBalanceTypes';
import {calculateSplitAmountsOptimized, roundToTwoDecimals} from './groupBalanceSplits';
import {generateSettlementSuggestionsOptimized} from './groupBalanceSettlementSuggestions';
import {suggestMinimizedSettlements} from './settlementStrategies';

export {PerformanceMonitor};
export {calculateSplitAmountsOptimized, roundToTwoDecimals};
export type {GroupBalanceCalculation, MemberBalance, PerformanceMetrics};

let DEFAULT_STRATEGY: 'pairwise' | 'minimize_transactions' = 'minimize_transactions';

export const setDefaultSettlementStrategy = (strategy: 'pairwise' | 'minimize_transactions') => {
  DEFAULT_STRATEGY = strategy;
};

const createMemberBalance = (member: GroupMember): MemberBalance => ({
  memberId: member.id,
  memberName: member.name,
  balance: 0,
  totalPaid: 0,
  totalOwed: 0,
  percentageOfTotalExpenses: 0,
  outstandingDebts: [],
  creditedAmounts: [],
  creditBalance: 0,
  advancePayments: {},
});

const initializeMatrices = (members: GroupMember[]) => {
  const memberBalances: Record<string, MemberBalance> = {};
  const debtMatrix: Record<string, Record<string, number>> = {};
  const debtTransactionMatrix: Record<string, Record<string, string[]>> = {};

  for (const member of members) {
    memberBalances[member.id] = createMemberBalance(member);
    debtMatrix[member.id] = {};
    debtTransactionMatrix[member.id] = {};
  }

  for (const creditor of members) {
    for (const debtor of members) {
      if (creditor.id === debtor.id) continue;
      debtMatrix[creditor.id][debtor.id] = 0;
      debtTransactionMatrix[creditor.id][debtor.id] = [];
    }
  }

  return {memberBalances, debtMatrix, debtTransactionMatrix};
};

const hasExplicitSettlementAmounts = (transaction: Transaction): boolean =>
  !!transaction.settledDebtAmounts &&
  Object.values(transaction.settledDebtAmounts).some((value) => (Number(value) || 0) > 0.001);

const processExpenseTransaction = (
  transaction: Transaction,
  members: GroupMember[],
  memberBalances: Record<string, MemberBalance>,
  debtMatrix: Record<string, Record<string, number>>,
  debtTransactionMatrix: Record<string, Record<string, string[]>>,
): number => {
  const expenseAmount = Math.abs(transaction.amount);
  const paidBy = transaction.paidBy;

  if (!paidBy || !memberBalances[paidBy]) {
    appLogger.warn('calculateGroupBalanceOptimized: Invalid paidBy member:', paidBy);
    return 0;
  }

  memberBalances[paidBy].totalPaid = roundToTwoDecimals(
    memberBalances[paidBy].totalPaid + expenseAmount,
  );

  const unsettledSplitAmounts = calculateSplitAmountsOptimized(
    transaction,
    members,
    expenseAmount,
    true,
    memberBalances,
  );
  const lifetimeSplitAmounts = calculateSplitAmountsOptimized(transaction, members, expenseAmount);

  for (const [memberId, lifetimeOwedAmount] of Object.entries(lifetimeSplitAmounts)) {
    if (!memberBalances[memberId]) continue;
    memberBalances[memberId].totalOwed = roundToTwoDecimals(
      memberBalances[memberId].totalOwed + lifetimeOwedAmount,
    );
  }

  for (const [memberId, unsettledOwedAmount] of Object.entries(unsettledSplitAmounts)) {
    if (!memberBalances[memberId]) continue;
    if (paidBy === memberId || unsettledOwedAmount <= 0.01) continue;

    debtMatrix[paidBy][memberId] = roundToTwoDecimals(
      debtMatrix[paidBy][memberId] + unsettledOwedAmount,
    );

    if (
      debtTransactionMatrix[paidBy][memberId] &&
      !debtTransactionMatrix[paidBy][memberId].includes(transaction.id)
    ) {
      debtTransactionMatrix[paidBy][memberId].push(transaction.id);
    }
  }

  return expenseAmount;
};

const processSettlementTransaction = (
  transaction: Transaction,
  memberBalances: Record<string, MemberBalance>,
  debtMatrix: Record<string, Record<string, number>>,
): number => {
  const paymentAmount = Math.abs(transaction.amount);
  if (hasExplicitSettlementAmounts(transaction)) return paymentAmount;

  const payer = transaction.paidBy;
  const receiver =
    transaction.receivedBy && transaction.receivedBy.length > 0
      ? transaction.receivedBy[0]
      : undefined;

  if (!payer || !receiver) return paymentAmount;
  if (payer === receiver || paymentAmount <= 0.001) return paymentAmount;
  if (!memberBalances[payer] || !memberBalances[receiver]) return paymentAmount;

  if (!debtMatrix[receiver]) debtMatrix[receiver] = {};
  if (debtMatrix[receiver][payer] === undefined) debtMatrix[receiver][payer] = 0;

  const currentDebt = debtMatrix[receiver][payer] || 0;

  if (currentDebt >= paymentAmount) {
    debtMatrix[receiver][payer] = roundToTwoDecimals(currentDebt - paymentAmount);
    return paymentAmount;
  }

  debtMatrix[receiver][payer] = 0;
  const surplus = roundToTwoDecimals(paymentAmount - currentDebt);
  if (surplus > 0.01) {
    const currentAdvance = memberBalances[payer].advancePayments[receiver] || 0;
    memberBalances[payer].advancePayments[receiver] = roundToTwoDecimals(currentAdvance + surplus);
  }

  return paymentAmount;
};

const simplifyCircularDebts = (
  members: GroupMember[],
  debtMatrix: Record<string, Record<string, number>>,
) => {
  for (const first of members) {
    for (const second of members) {
      if (first.id === second.id) continue;
      if (!debtMatrix[first.id]?.[second.id] || !debtMatrix[second.id]?.[first.id]) continue;

      const firstDebt = debtMatrix[first.id][second.id] || 0;
      const secondDebt = debtMatrix[second.id][first.id] || 0;
      if (firstDebt <= 0 || secondDebt <= 0) continue;

      const reduction = Math.min(firstDebt, secondDebt);
      debtMatrix[first.id][second.id] = roundToTwoDecimals(firstDebt - reduction);
      debtMatrix[second.id][first.id] = roundToTwoDecimals(secondDebt - reduction);
    }
  }
};

const consumeAdvancePayments = (
  members: GroupMember[],
  memberBalances: Record<string, MemberBalance>,
  debtMatrix: Record<string, Record<string, number>>,
) => {
  for (const payer of members) {
    const advances = memberBalances[payer.id].advancePayments;
    for (const [creditorId, advanceAmount] of Object.entries(advances)) {
      if (advanceAmount <= 0.01) continue;
      const debt = debtMatrix[creditorId]?.[payer.id] || 0;
      if (debt <= 0.01) continue;

      const reduction = Math.min(debt, advanceAmount);
      debtMatrix[creditorId][payer.id] = roundToTwoDecimals(debt - reduction);
      memberBalances[payer.id].advancePayments[creditorId] = roundToTwoDecimals(
        advanceAmount - reduction,
      );
    }
  }
};

const updateNetBalances = (
  totalExpenses: number,
  memberBalances: Record<string, MemberBalance>,
  debtMatrix: Record<string, Record<string, number>>,
) => {
  const owedByOthersMap = new Map<string, number>();
  const owesToOthersMap = new Map<string, number>();

  for (const [creditorId, debtors] of Object.entries(debtMatrix)) {
    for (const [debtorId, amount] of Object.entries(debtors)) {
      if (amount <= 0.01) continue;
      owedByOthersMap.set(creditorId, (owedByOthersMap.get(creditorId) || 0) + amount);
      owesToOthersMap.set(debtorId, (owesToOthersMap.get(debtorId) || 0) + amount);
    }
  }

  for (const [memberId, member] of Object.entries(memberBalances)) {
    const owedByOthers = owedByOthersMap.get(memberId) || 0;
    const owesToOthers = owesToOthersMap.get(memberId) || 0;
    member.balance = roundToTwoDecimals(owedByOthers - owesToOthers);
    member.percentageOfTotalExpenses =
      totalExpenses > 0 ? (member.totalOwed / totalExpenses) * 100 : 0;
  }
};

const applyDebtObjectsToMemberBalances = (
  debtMatrix: Record<string, Record<string, number>>,
  debtTransactionMatrix: Record<string, Record<string, string[]>>,
  memberBalances: Record<string, MemberBalance>,
) => {
  for (const [creditorId, debtors] of Object.entries(debtMatrix)) {
    const creditor = memberBalances[creditorId];
    if (!creditor) continue;

    for (const [debtorId, amount] of Object.entries(debtors)) {
      if (amount <= 0.01) continue;

      const debtor = memberBalances[debtorId];
      if (!debtor) continue;

      const debt: MemberDebt = {
        creditorId,
        creditorName: creditor.memberName,
        debtorId,
        debtorName: debtor.memberName,
        amount,
        transactionIds: debtTransactionMatrix[creditorId][debtorId] || [],
        settledTransactionIds: [],
        lastUpdated: new Date(),
      };

      creditor.creditedAmounts.push(debt);
      debtor.outstandingDebts.push(debt);
    }
  }
};

export const calculateGroupBalanceOptimized = (
  transactions: Transaction[],
  members: GroupMember[],
): GroupBalanceCalculation => {
  const performanceMonitor = PerformanceMonitor.getInstance();
  const startTime = performance.now();
  const cacheKey = performanceMonitor.getCacheKey(transactions, members);
  const cachedResult = performanceMonitor.getCachedResult(cacheKey);

  if (cachedResult) {
    return {...cachedResult, isCached: true};
  }

  const {memberBalances, debtMatrix, debtTransactionMatrix} = initializeMatrices(members);
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let totalExpenses = 0;
  let totalPayments = 0;

  for (const transaction of sortedTransactions) {
    if (transaction.type === 'expense' && !transaction.isSettlement) {
      totalExpenses += processExpenseTransaction(
        transaction,
        members,
        memberBalances,
        debtMatrix,
        debtTransactionMatrix,
      );
    } else if (transaction.isSettlement) {
      totalPayments += processSettlementTransaction(transaction, memberBalances, debtMatrix);
    }
  }

  simplifyCircularDebts(members, debtMatrix);
  consumeAdvancePayments(members, memberBalances, debtMatrix);
  updateNetBalances(totalExpenses, memberBalances, debtMatrix);
  applyDebtObjectsToMemberBalances(debtMatrix, debtTransactionMatrix, memberBalances);

  const settlementSuggestions =
    DEFAULT_STRATEGY === 'minimize_transactions'
      ? suggestMinimizedSettlements(Object.values(memberBalances))
      : generateSettlementSuggestionsOptimized(debtMatrix, memberBalances);

  const executionTime = performance.now() - startTime;
  const complexityScore = transactions.length * members.length + members.length * members.length;
  const memoryUsage =
    transactions.length * 100 +
    members.length * 50 +
    Object.keys(debtMatrix).length * Object.keys(debtMatrix).length * 8;

  const result: GroupBalanceCalculation = {
    totalExpenses,
    totalPayments,
    netBalance: totalPayments - totalExpenses,
    memberCount: members.length,
    transactionCount: transactions.length,
    averageExpensePerMember: members.length > 0 ? totalExpenses / members.length : 0,
    memberBalances: Object.values(memberBalances),
    debtMatrix,
    settlementSuggestions,
    performanceMetrics: {
      executionTime,
      memoryUsage,
      complexityScore,
      cacheHitRate: 0,
      memberCount: members.length,
      transactionCount: transactions.length,
    },
    isCached: false,
  };

  performanceMonitor.setCachedResult(cacheKey, result, result.performanceMetrics, {
    transactionHash: performanceMonitor.generateTransactionHash(transactions),
    memberHash: performanceMonitor.generateMemberHash(members),
  });

  appLogger.debug('calculateGroupBalanceOptimized: Calculation complete:', {
    totalExpenses,
    totalPayments,
    memberCount: members.length,
    transactionCount: transactions.length,
    executionTime: `${executionTime.toFixed(2)}ms`,
    complexityScore,
    cached: false,
  });

  return result;
};

export const calculateMemberBalanceOptimized = (
  memberId: string,
  transactions: Transaction[],
  members: GroupMember[],
): MemberBalance | null => {
  const result = calculateGroupBalanceOptimized(transactions, members);
  return result.memberBalances.find((member) => member.memberId === memberId) || null;
};

export const getMemberDebtsOptimized = (
  memberId: string,
  transactions: Transaction[],
  members: GroupMember[],
): {owes: MemberDebt[]; owed: MemberDebt[]} => {
  const result = calculateGroupBalanceOptimized(transactions, members);
  const memberBalance = result.memberBalances.find((member) => member.memberId === memberId);
  if (!memberBalance) return {owes: [], owed: []};

  return {
    owes: memberBalance.outstandingDebts,
    owed: memberBalance.creditedAmounts,
  };
};

export const isGroupSettledOptimized = (
  transactions: Transaction[],
  members: GroupMember[],
  tolerance: number = 0.01,
): boolean => {
  const result = calculateGroupBalanceOptimized(transactions, members);
  return result.memberBalances.every((member) => Math.abs(member.balance) <= tolerance);
};

export const PerformanceUtils = {
  clearCache: () => PerformanceMonitor.getInstance().clearCache(),
  getCacheStats: () => PerformanceMonitor.getInstance().getCacheStats(),
  getCacheKey: (transactions: Transaction[], members: GroupMember[]) =>
    PerformanceMonitor.getInstance().getCacheKey(transactions, members),
};

export const calculateGroupBalance = calculateGroupBalanceOptimized;
export const calculateSplitAmounts = calculateSplitAmountsOptimized;
export const calculateMemberBalance = calculateMemberBalanceOptimized;
export const getMemberDebts = getMemberDebtsOptimized;
export const isGroupSettled = isGroupSettledOptimized;
