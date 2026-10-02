import type {GroupMember, Transaction} from '../types';
import {PerformanceMonitor} from './groupBalanceUtils.optimized';
import {
  applyDebtMatrixDelta,
  calculateSplitAmountsForTransaction,
  cloneCachedDebtState,
  createEmptyDebtMatrixDelta,
  createTransactionDependency,
  getOldestDependencyTimestamp,
  updateMemberBalancesForDelta,
} from './incrementalDebtCalculation/incrementalDebtHelpers';
import type {
  CachedDebtState,
  DebtMatrixDelta,
  IncrementalUpdate,
  TransactionDependency,
} from './incrementalDebtCalculation/incrementalDebtTypes';

class IncrementalDebtCalculator {
  private static instance: IncrementalDebtCalculator;
  private stateCache: Map<string, CachedDebtState> = new Map();
  private performanceMonitor = PerformanceMonitor.getInstance();

  static getInstance(): IncrementalDebtCalculator {
    if (!IncrementalDebtCalculator.instance) {
      IncrementalDebtCalculator.instance = new IncrementalDebtCalculator();
    }
    return IncrementalDebtCalculator.instance;
  }

  calculateTransactionDelta(
    transaction: Transaction,
    members: GroupMember[],
    existingState?: CachedDebtState,
  ): DebtMatrixDelta {
    const delta = createEmptyDebtMatrixDelta();

    if (transaction.type === 'expense' && !transaction.isSettlement) {
      this.addExpenseTransactionDelta(delta, transaction, members, existingState);
    } else if (transaction.isSettlement) {
      this.addSettlementTransactionDelta(delta, transaction, existingState);
    }

    return delta;
  }

  applyIncrementalChanges(
    existingState: CachedDebtState,
    delta: DebtMatrixDelta,
    transaction: Transaction,
  ): CachedDebtState {
    const newState = cloneCachedDebtState(existingState);

    applyDebtMatrixDelta(newState, delta);
    updateMemberBalancesForDelta(newState, delta);
    newState.transactionDependencies.set(
      transaction.id,
      createTransactionDependency(transaction.id, delta),
    );

    return newState;
  }

  getGroupCacheKey(transactions: Transaction[], members: GroupMember[]): string {
    const txHash = this.performanceMonitor.generateTransactionHash(transactions);
    const memberHash = this.performanceMonitor.generateMemberHash(members);
    return `group_${txHash}_${memberHash}`;
  }

  getCachedState(cacheKey: string): CachedDebtState | null {
    return this.stateCache.get(cacheKey) || null;
  }

  cacheState(cacheKey: string, state: CachedDebtState): void {
    const maxCacheSize = 10;
    if (this.stateCache.size >= maxCacheSize) {
      const oldestKey = this.stateCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.stateCache.delete(oldestKey);
      }
    }

    this.stateCache.set(cacheKey, state);
  }

  clearGroupCache(cacheKey: string): void {
    this.stateCache.delete(cacheKey);
  }

  clearAllCaches(): void {
    this.stateCache.clear();
  }

  optimizeCache(maxAgeMs: number = 5 * 60 * 1000): void {
    const now = Date.now();
    for (const [key, state] of this.stateCache.entries()) {
      const oldestDependency = getOldestDependencyTimestamp(state.transactionDependencies, now);

      if (now - oldestDependency > maxAgeMs) {
        this.stateCache.delete(key);
      }
    }
  }

  getCacheStats() {
    return {
      cachedGroups: this.stateCache.size,
      totalDependencies: Array.from(this.stateCache.values()).reduce(
        (sum, state) => sum + state.transactionDependencies.size,
        0,
      ),
      oldestEntry: this.getOldestEntryAge(),
    };
  }

  private addExpenseTransactionDelta(
    delta: DebtMatrixDelta,
    transaction: Transaction,
    members: GroupMember[],
    existingState?: CachedDebtState,
  ): void {
    const expenseAmount = Math.abs(transaction.amount);
    const paidBy = transaction.paidBy;

    if (!paidBy) return;

    const splitAmounts = calculateSplitAmountsForTransaction(transaction, members, expenseAmount);

    for (const [memberId, owedAmount] of Object.entries(splitAmounts)) {
      if (memberId === paidBy || owedAmount <= 0.01) continue;

      const currentAmount = existingState?.debtMatrix[paidBy]?.[memberId] || 0;

      if (currentAmount === 0) {
        delta.added.push({
          creditorId: paidBy,
          debtorId: memberId,
          amount: owedAmount,
        });
      } else {
        delta.modified.push({
          creditorId: paidBy,
          debtorId: memberId,
          oldAmount: currentAmount,
          newAmount: currentAmount + owedAmount,
        });
      }
    }
  }

  private addSettlementTransactionDelta(
    delta: DebtMatrixDelta,
    transaction: Transaction,
    existingState?: CachedDebtState,
  ): void {
    const paymentAmount = Math.abs(transaction.amount);
    const payer = transaction.paidBy;
    const receiver =
      transaction.receivedBy && transaction.receivedBy.length > 0
        ? transaction.receivedBy[0]
        : undefined;

    if (!payer || !receiver) return;

    const currentAmount = existingState?.debtMatrix[receiver]?.[payer] || 0;
    if (currentAmount <= 0) return;

    const newAmount = Math.max(0, currentAmount - paymentAmount);

    if (currentAmount === newAmount) {
      return;
    }

    if (newAmount === 0) {
      delta.removed.push({
        creditorId: receiver,
        debtorId: payer,
        amount: currentAmount,
      });
      return;
    }

    delta.modified.push({
      creditorId: receiver,
      debtorId: payer,
      oldAmount: currentAmount,
      newAmount,
    });
  }

  private getOldestEntryAge(): number {
    const now = Date.now();
    let oldestAge = 0;

    for (const state of this.stateCache.values()) {
      const oldestDependency = getOldestDependencyTimestamp(state.transactionDependencies, now);
      const age = now - oldestDependency;
      if (age > oldestAge) {
        oldestAge = age;
      }
    }

    return oldestAge;
  }
}

export const incrementalDebtCalculator = IncrementalDebtCalculator.getInstance();

export type {DebtMatrixDelta, IncrementalUpdate, CachedDebtState, TransactionDependency};
