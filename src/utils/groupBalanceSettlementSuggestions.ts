import type {SettlementSuggestion} from '../types';
import {logger as appLogger} from '../services/LoggerService';
import type {MemberBalance} from './groupBalanceTypes';
import {roundToTwoDecimals} from './groupBalanceSplits';

export const generateSettlementSuggestionsOptimized = (
  debtMatrix: Record<string, Record<string, number>>,
  memberBalances: Record<string, MemberBalance>,
): SettlementSuggestion[] => {
  appLogger.debug('generateSettlementSuggestionsOptimized: Processing with O(n^2) algorithm');

  const suggestions: SettlementSuggestion[] = [];
  const creditorIds = Object.keys(debtMatrix);

  for (const creditorId of creditorIds) {
    const creditor = memberBalances[creditorId];
    if (!creditor) continue;

    const debtors = debtMatrix[creditorId];
    for (const [debtorId, amount] of Object.entries(debtors)) {
      const debtor = memberBalances[debtorId];
      if (!debtor || amount <= 0.01) continue;

      const advanceToCreditor = debtor.advancePayments?.[creditorId] || 0;
      const effectiveDebt = roundToTwoDecimals(amount - advanceToCreditor);

      if (effectiveDebt > 0.01) {
        suggestions.push({
          id: `settlement_${creditorId}_${debtorId}_${Date.now()}`,
          fromMemberId: debtorId,
          fromMemberName: debtor.memberName,
          toMemberId: creditorId,
          toMemberName: creditor.memberName,
          amount: effectiveDebt,
          description: `${debtor.memberName} pays ${creditor.memberName} (${effectiveDebt.toFixed(2)} after ${advanceToCreditor.toFixed(2)} advance)`,
          resolvesDebts: [],
          priority: suggestions.length + 1,
        });
      }
    }
  }

  appLogger.debug(
    'generateSettlementSuggestionsOptimized: Generated',
    suggestions.length,
    'pairwise settlement suggestions',
  );
  return suggestions;
};
