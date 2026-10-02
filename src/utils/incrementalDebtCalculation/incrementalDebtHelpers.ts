import type {GroupMember, Transaction} from '../../types';
import type {CachedDebtState, DebtMatrixDelta, TransactionDependency} from './incrementalDebtTypes';

export function createEmptyDebtMatrixDelta(): DebtMatrixDelta {
  return {
    added: [],
    modified: [],
    removed: [],
  };
}

export function calculateSplitAmountsForTransaction(
  transaction: Transaction,
  members: GroupMember[],
  expenseAmount: number,
): Record<string, number> {
  const splitAmounts: Record<string, number> = {};

  if (transaction.splitDetails && transaction.splitDetails.length > 0) {
    for (const split of transaction.splitDetails) {
      splitAmounts[split.memberId] = (splitAmounts[split.memberId] || 0) + (split.amount || 0);
    }
  } else if (transaction.splitAmounts && Object.keys(transaction.splitAmounts).length > 0) {
    return transaction.splitAmounts;
  } else if (transaction.splitAmong && transaction.splitAmong.length > 0) {
    const amountPerMember = expenseAmount / transaction.splitAmong.length;
    for (const memberId of transaction.splitAmong) {
      splitAmounts[memberId] = amountPerMember;
    }
  } else {
    const amountPerMember = expenseAmount / members.length;
    for (const member of members) {
      splitAmounts[member.id] = amountPerMember;
    }
  }

  return splitAmounts;
}

export function cloneCachedDebtState(existingState: CachedDebtState): CachedDebtState {
  return {
    ...existingState,
    debtMatrix: {...existingState.debtMatrix},
    memberBalances: {...existingState.memberBalances},
    transactionDependencies: new Map(existingState.transactionDependencies),
    version: existingState.version + 1,
  };
}

export function applyDebtMatrixDelta(state: CachedDebtState, delta: DebtMatrixDelta): void {
  for (const addition of delta.added) {
    if (!state.debtMatrix[addition.creditorId]) {
      state.debtMatrix[addition.creditorId] = {};
    }
    state.debtMatrix[addition.creditorId][addition.debtorId] = addition.amount;
  }

  for (const modification of delta.modified) {
    if (modification.newAmount <= 0.01) {
      if (state.debtMatrix[modification.creditorId]) {
        delete state.debtMatrix[modification.creditorId][modification.debtorId];
      }
    } else {
      if (!state.debtMatrix[modification.creditorId]) {
        state.debtMatrix[modification.creditorId] = {};
      }
      state.debtMatrix[modification.creditorId][modification.debtorId] = modification.newAmount;
    }
  }

  for (const removal of delta.removed) {
    if (state.debtMatrix[removal.creditorId]) {
      delete state.debtMatrix[removal.creditorId][removal.debtorId];
    }
  }
}

export function updateMemberBalancesForDelta(state: CachedDebtState, delta: DebtMatrixDelta): void {
  const memberBalanceChanges = new Map<string, number>();

  for (const addition of delta.added) {
    addBalanceChange(memberBalanceChanges, addition.creditorId, addition.amount);
    addBalanceChange(memberBalanceChanges, addition.debtorId, -addition.amount);
  }

  for (const modification of delta.modified) {
    const change = modification.newAmount - modification.oldAmount;
    if (change !== 0) {
      addBalanceChange(memberBalanceChanges, modification.creditorId, change);
      addBalanceChange(memberBalanceChanges, modification.debtorId, -change);
    }
  }

  for (const removal of delta.removed) {
    addBalanceChange(memberBalanceChanges, removal.creditorId, -removal.amount);
    addBalanceChange(memberBalanceChanges, removal.debtorId, removal.amount);
  }

  for (const [memberId, balanceChange] of memberBalanceChanges.entries()) {
    if (state.memberBalances[memberId]) {
      state.memberBalances[memberId].balance =
        Math.round((state.memberBalances[memberId].balance + balanceChange) * 100) / 100;
    }
  }
}

export function getAffectedMembers(delta: DebtMatrixDelta): string[] {
  const affected = new Set<string>();

  for (const addition of delta.added) {
    affected.add(addition.creditorId);
    affected.add(addition.debtorId);
  }

  for (const modification of delta.modified) {
    affected.add(modification.creditorId);
    affected.add(modification.debtorId);
  }

  for (const removal of delta.removed) {
    affected.add(removal.creditorId);
    affected.add(removal.debtorId);
  }

  return Array.from(affected);
}

export function createTransactionDependency(
  transactionId: string,
  delta: DebtMatrixDelta,
): TransactionDependency {
  return {
    transactionId,
    affectsDebts: [
      ...delta.added.map((debt) => `${debt.creditorId}-${debt.debtorId}`),
      ...delta.modified.map((debt) => `${debt.creditorId}-${debt.debtorId}`),
      ...delta.removed.map((debt) => `${debt.creditorId}-${debt.debtorId}`),
    ],
    affectedMembers: getAffectedMembers(delta),
    lastModified: Date.now(),
  };
}

export function getOldestDependencyTimestamp(
  transactionDependencies: Map<string, TransactionDependency>,
  fallback: number,
): number {
  return Array.from(transactionDependencies.values()).reduce(
    (oldest, dependency) => (dependency.lastModified < oldest ? dependency.lastModified : oldest),
    fallback,
  );
}

function addBalanceChange(
  memberBalanceChanges: Map<string, number>,
  memberId: string,
  amount: number,
): void {
  memberBalanceChanges.set(memberId, (memberBalanceChanges.get(memberId) || 0) + amount);
}
