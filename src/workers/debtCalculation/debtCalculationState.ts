import type {GroupMember, MemberBalance} from '../../types';
import type {WorkerCalculationState} from './debtCalculationTypes';

export function initializeCalculationState(members: GroupMember[]): WorkerCalculationState {
  const memberBalances: Record<string, MemberBalance> = {};
  const debtMatrix: Record<string, Record<string, number>> = {};
  const debtTransactionMatrix: Record<string, Record<string, string[]>> = {};

  for (const member of members) {
    memberBalances[member.id] = {
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
    };
    debtMatrix[member.id] = {};
    debtTransactionMatrix[member.id] = {};
  }

  for (const creditor of members) {
    for (const debtor of members) {
      if (creditor.id !== debtor.id) {
        debtMatrix[creditor.id][debtor.id] = 0;
        debtTransactionMatrix[creditor.id][debtor.id] = [];
      }
    }
  }

  return {
    debtMatrix,
    debtTransactionMatrix,
    memberBalances,
  };
}
