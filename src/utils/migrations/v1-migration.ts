import AsyncStorage from '@react-native-async-storage/async-storage';
import {EnhancedGroup} from '@/features/groups/types';
import {Transaction} from '../../types';

const MIGRATION_FLAG = '@BuddyApp:migrations:v1_done';

function fillFxFields(t: Transaction, groupCurrency: string): Transaction {
  if (!t.transactionCurrency) t.transactionCurrency = groupCurrency;
  if (typeof t.fxRateApplied !== 'number') t.fxRateApplied = 1;
  return t;
}

function backfillSettledDebtAmounts(group: EnhancedGroup, settlement: Transaction): Transaction {
  if (!settlement.isSettlement) return settlement;
  if (settlement.settledDebtAmounts && Object.keys(settlement.settledDebtAmounts).length > 0)
    return settlement;
  const payerId = settlement.paidBy || '';
  const remainingTotal = Math.abs(settlement.amount || 0);
  if (!payerId || remainingTotal <= 0) return settlement;

  const resolved: Record<string, number> = {};
  let remaining = remainingTotal;

  const debtIds = settlement.settledDebts || [];
  for (const debtId of debtIds) {
    if (remaining <= 0.001) break;
    const original = group.transactions.find((t) => t.id === debtId);
    if (!original || !original.splitDetails) continue;
    const split = original.splitDetails.find((s) => s.memberId === payerId);
    if (!split) continue;
    const outstanding = Math.max(0, (split.amount || 0) - (split.settledAmount || 0));
    if (outstanding <= 0.001) continue;
    const settle = Math.min(outstanding, remaining);
    resolved[debtId] = settle;
    remaining -= settle;
  }

  return {...settlement, settledDebtAmounts: resolved};
}

export async function runV1Migration(
  groups: EnhancedGroup[],
  groupCurrency: string,
): Promise<EnhancedGroup[]> {
  try {
    const flag = await AsyncStorage.getItem(MIGRATION_FLAG);
    if (flag === 'done') return groups;

    const migrated = groups.map((g) => {
      const txs = (g.transactions || []).map((tx) => {
        let t = {...tx};
        t = fillFxFields(t, groupCurrency);
        if (t.isSettlement) t = backfillSettledDebtAmounts(g, t);
        return t;
      });
      return {...g, transactions: txs};
    });

    await AsyncStorage.setItem(MIGRATION_FLAG, 'done');
    return migrated;
  } catch {
    return groups;
  }
}
