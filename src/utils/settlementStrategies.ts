import {MemberBalance, SettlementSuggestion} from '../types';

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function suggestMinimizedSettlements(
  memberBalances: MemberBalance[],
): SettlementSuggestion[] {
  const positives: {memberId: string; name: string; amount: number}[] = [];
  const negatives: {memberId: string; name: string; amount: number}[] = [];

  for (const mb of memberBalances) {
    const amt = roundToCents(mb.balance);
    if (amt > 0) positives.push({memberId: mb.memberId, name: mb.memberName, amount: amt});
    else if (amt < 0) negatives.push({memberId: mb.memberId, name: mb.memberName, amount: -amt});
  }

  positives.sort((a, b) => b.amount - a.amount);
  negatives.sort((a, b) => b.amount - a.amount);

  const suggestions: SettlementSuggestion[] = [];
  let i = 0,
    j = 0,
    idCounter = 1;

  while (i < positives.length && j < negatives.length) {
    const cred = positives[i];
    const debt = negatives[j];
    const pay = roundToCents(Math.min(cred.amount, debt.amount));

    if (pay > 0) {
      suggestions.push({
        id: `min-${idCounter++}`,
        fromMemberId: debt.memberId,
        fromMemberName: debt.name,
        toMemberId: cred.memberId,
        toMemberName: cred.name,
        amount: pay,
        description: 'Optimized settlement',
        resolvesDebts: [],
        priority: 0,
        strategyUsed: 'minimize_transactions',
        routingTrace: {from: debt.memberId, to: cred.memberId, via: [], amount: pay},
      });
      cred.amount = roundToCents(cred.amount - pay);
      debt.amount = roundToCents(debt.amount - pay);
    }

    if (cred.amount <= 0.001) i++;
    if (debt.amount <= 0.001) j++;
  }

  return suggestions;
}
