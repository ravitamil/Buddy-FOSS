import type {Transaction} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';

import type {SettledDebt} from './settlementHistoryTypes';

export const firstName = (name: string): string => name.split(' ')[0] || name;

export const getSettledDebts = (group: EnhancedGroup, transaction: Transaction): SettledDebt[] => {
  if (!transaction.settledDebts || !group.transactions) return [];

  return transaction.settledDebts.flatMap((debtTransactionId) => {
    const originalTx = group.transactions.find((item) => item.id === debtTransactionId);
    if (!originalTx) return [];

    const amount = transaction.settledDebtAmounts?.[debtTransactionId] || 0;
    if (amount <= 0) return [];

    return [{description: originalTx.description, amount}];
  });
};
