import type {MemberBalance, SettlementSuggestion} from '../../types';
import {roundToTwoDecimals} from './debtCalculationMetrics';

export function generateSettlementSuggestionsInWorker(
  debtMatrix: Record<string, Record<string, number>>,
  memberBalances: Record<string, MemberBalance>,
): SettlementSuggestion[] {
  const suggestions: SettlementSuggestion[] = [];

  for (const [creditorId, debtors] of Object.entries(debtMatrix)) {
    const creditor = memberBalances[creditorId];
    if (!creditor) continue;

    for (const [debtorId, amount] of Object.entries(debtors)) {
      const suggestion = createSettlementSuggestion(
        creditorId,
        debtorId,
        amount,
        creditor,
        memberBalances[debtorId],
        suggestions.length + 1,
      );

      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
  }

  return suggestions;
}

function createSettlementSuggestion(
  creditorId: string,
  debtorId: string,
  amount: number,
  creditor: MemberBalance,
  debtor: MemberBalance | undefined,
  priority: number,
): SettlementSuggestion | null {
  if (amount <= 0.01 || !debtor) return null;

  const advanceToCreditor = debtor.advancePayments?.[creditorId] || 0;
  const effectiveDebt = roundToTwoDecimals(amount - advanceToCreditor);

  if (effectiveDebt <= 0.01) return null;

  return {
    id: `settlement_${creditorId}_${debtorId}_${Date.now()}`,
    fromMemberId: debtorId,
    fromMemberName: debtor.memberName,
    toMemberId: creditorId,
    toMemberName: creditor.memberName,
    amount: effectiveDebt,
    description: `${debtor.memberName} pays ${creditor.memberName} (${effectiveDebt.toFixed(2)} after ${advanceToCreditor.toFixed(2)} advance)`,
    resolvesDebts: [],
    priority,
  };
}
