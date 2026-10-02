import type {GroupMember, Transaction} from '../../types';
import type {GroupBalanceCalculation} from '../../utils/groupBalanceUtils.optimized';
import {estimateMemoryUsage, roundToTwoDecimals} from './debtCalculationMetrics';
import {generateSettlementSuggestionsInWorker} from './debtCalculationSettlements';
import {calculateSplitAmountsInWorker} from './debtCalculationSplits';
import {initializeCalculationState} from './debtCalculationState';
import type {WorkerCalculationState, WorkerCalculationTotals} from './debtCalculationTypes';

export function calculateGroupBalanceInWorker(
  transactions: Transaction[],
  members: GroupMember[],
  chunkSize: number,
  abortSignal: AbortSignal,
  onProgress: (stage: string, progress: number) => void,
): GroupBalanceCalculation {
  onProgress('Processing transactions...', 0.2);
  throwIfCancelled(abortSignal);

  const state = initializeCalculationState(members);
  const totals: WorkerCalculationTotals = {
    totalExpenses: 0,
    totalPayments: 0,
  };

  onProgress('Calculating debts...', 0.4);
  processTransactionsInChunks(
    transactions,
    members,
    chunkSize,
    abortSignal,
    onProgress,
    state,
    totals,
  );

  onProgress('Calculating balances...', 0.8);
  calculateNetBalances(state, totals.totalExpenses);

  onProgress('Generating settlement suggestions...', 0.9);
  const settlementSuggestions = generateSettlementSuggestionsInWorker(
    state.debtMatrix,
    state.memberBalances,
  );

  onProgress('Finalizing...', 1.0);

  return {
    totalExpenses: totals.totalExpenses,
    totalPayments: totals.totalPayments,
    netBalance: totals.totalPayments - totals.totalExpenses,
    memberCount: members.length,
    transactionCount: transactions.length,
    averageExpensePerMember: members.length > 0 ? totals.totalExpenses / members.length : 0,
    memberBalances: Object.values(state.memberBalances),
    debtMatrix: state.debtMatrix,
    settlementSuggestions,
    performanceMetrics: {
      executionTime: 0,
      memoryUsage: estimateMemoryUsage(transactions, members),
      complexityScore: transactions.length * members.length + members.length * members.length,
      cacheHitRate: 0,
      memberCount: members.length,
      transactionCount: transactions.length,
    },
    isCached: false,
  };
}

function processTransactionsInChunks(
  transactions: Transaction[],
  members: GroupMember[],
  chunkSize: number,
  abortSignal: AbortSignal,
  onProgress: (stage: string, progress: number) => void,
  state: WorkerCalculationState,
  totals: WorkerCalculationTotals,
) {
  const totalChunks = Math.ceil(transactions.length / chunkSize);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    throwIfCancelled(abortSignal);

    const startIndex = chunkIndex * chunkSize;
    const endIndex = Math.min(startIndex + chunkSize, transactions.length);
    const chunk = transactions.slice(startIndex, endIndex);

    for (const transaction of chunk) {
      throwIfCancelled(abortSignal);
      processTransaction(transaction, members, state, totals);
    }

    const chunkProgress = ((chunkIndex + 1) / totalChunks) * 0.4;
    onProgress(`Processing chunk ${chunkIndex + 1}/${totalChunks}...`, 0.4 + chunkProgress * 0.4);
  }
}

function processTransaction(
  transaction: Transaction,
  members: GroupMember[],
  state: WorkerCalculationState,
  totals: WorkerCalculationTotals,
) {
  if (transaction.type === 'expense' && !transaction.isSettlement) {
    processExpenseTransaction(transaction, members, state, totals);
  } else if (transaction.isSettlement) {
    processSettlementTransaction(transaction, state, totals);
  }
}

function processExpenseTransaction(
  transaction: Transaction,
  members: GroupMember[],
  state: WorkerCalculationState,
  totals: WorkerCalculationTotals,
) {
  const expenseAmount = Math.abs(transaction.amount);
  totals.totalExpenses += expenseAmount;

  const paidBy = transaction.paidBy;
  if (!paidBy || !state.memberBalances[paidBy]) return;

  state.memberBalances[paidBy].totalPaid = roundToTwoDecimals(
    state.memberBalances[paidBy].totalPaid + expenseAmount,
  );

  const splitAmounts = calculateSplitAmountsInWorker(
    transaction,
    members,
    expenseAmount,
    state.memberBalances,
  );

  updateMemberOwedTotals(splitAmounts, state);
  updateDebtMatrix(transaction, paidBy, splitAmounts, state);
}

function updateMemberOwedTotals(
  splitAmounts: Record<string, number>,
  state: WorkerCalculationState,
) {
  for (const [memberId, owedAmount] of Object.entries(splitAmounts)) {
    if (!state.memberBalances[memberId]) continue;
    state.memberBalances[memberId].totalOwed = roundToTwoDecimals(
      state.memberBalances[memberId].totalOwed + owedAmount,
    );
  }
}

function updateDebtMatrix(
  transaction: Transaction,
  paidBy: string,
  splitAmounts: Record<string, number>,
  state: WorkerCalculationState,
) {
  for (const [memberId, owedAmount] of Object.entries(splitAmounts)) {
    if (!state.memberBalances[memberId]) continue;

    if (paidBy !== memberId && owedAmount > 0.01) {
      state.debtMatrix[paidBy][memberId] = roundToTwoDecimals(
        state.debtMatrix[paidBy][memberId] + owedAmount,
      );

      if (
        state.debtTransactionMatrix[paidBy][memberId] &&
        !state.debtTransactionMatrix[paidBy][memberId].includes(transaction.id)
      ) {
        state.debtTransactionMatrix[paidBy][memberId].push(transaction.id);
      }
    }
  }
}

function processSettlementTransaction(
  transaction: Transaction,
  state: WorkerCalculationState,
  totals: WorkerCalculationTotals,
) {
  const paymentAmount = Math.abs(transaction.amount);
  totals.totalPayments += paymentAmount;

  const payer = transaction.paidBy;
  const receiver =
    transaction.receivedBy && transaction.receivedBy.length > 0
      ? transaction.receivedBy[0]
      : undefined;

  if (
    !payer ||
    typeof receiver !== 'string' ||
    !state.memberBalances[payer] ||
    !state.memberBalances[receiver] ||
    !state.debtMatrix[receiver] ||
    state.debtMatrix[receiver][payer] === undefined
  ) {
    return;
  }

  const currentDebt = state.debtMatrix[receiver][payer] || 0;

  if (currentDebt > 0.01) {
    const remainingDebt = Math.max(0, currentDebt - paymentAmount);
    state.debtMatrix[receiver][payer] = roundToTwoDecimals(remainingDebt);

    if (remainingDebt <= 0.01) {
      state.debtMatrix[receiver][payer] = 0;
    }
  }
}

function calculateNetBalances(state: WorkerCalculationState, totalExpenses: number) {
  for (const memberId of Object.keys(state.memberBalances)) {
    const member = state.memberBalances[memberId];
    const owedByOthers = Object.values(state.debtMatrix[memberId] || {}).reduce(
      (sum, amount) => sum + (amount || 0),
      0,
    );
    const owesToOthers = Object.values(state.debtMatrix).reduce(
      (sum, row) => sum + (row[memberId] || 0),
      0,
    );
    const creditBalance = member.creditBalance || 0;

    member.balance = roundToTwoDecimals(owedByOthers - owesToOthers - creditBalance);
    member.percentageOfTotalExpenses =
      totalExpenses > 0 ? (member.totalOwed / totalExpenses) * 100 : 0;
  }
}

function throwIfCancelled(abortSignal: AbortSignal) {
  if (abortSignal.aborted) {
    throw new Error('Calculation cancelled');
  }
}
