import {MemberBalance} from '../../types';

export function computeDebtAgingBuckets(transactionsDates: string[]): Record<string, number> {
  const now = Date.now();
  const buckets: Record<string, number> = {'<30d': 0, '30-60d': 0, '60-90d': 0, '>90d': 0};
  for (const d of transactionsDates) {
    const dt = new Date(d).getTime();
    const days = Math.floor((now - dt) / (1000 * 60 * 60 * 24));
    if (days < 30) buckets['<30d']++;
    else if (days < 60) buckets['30-60d']++;
    else if (days < 90) buckets['60-90d']++;
    else buckets['>90d']++;
  }
  return buckets;
}

export function memberSettlementRatios(memberBalances: MemberBalance[]): Record<string, number> {
  const ratios: Record<string, number> = {};
  for (const mb of memberBalances) {
    const owed = mb.outstandingDebts.reduce((s, d) => s + d.amount, 0);
    const credit = mb.creditedAmounts.reduce((s, d) => s + d.amount, 0);
    ratios[mb.memberId] = owed > 0 ? credit / owed : 1;
  }
  return ratios;
}
