import {Transaction} from '../types';

export function prepareTransactionsWithFx(
  transactions: Transaction[] | null | undefined,
  groupCurrency: string,
): Transaction[] {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  return transactions
    .filter((t): t is Transaction => !!t && typeof t === 'object')
    .map((t) => {
      if (t.type !== 'expense') {
        return t;
      }

      const rawAmount = Number(t.amount);
      const amount = Number.isFinite(rawAmount) ? Math.abs(rawAmount) : 0;
      const rawRate = Number(t.fxRateApplied);
      const rate = Number.isFinite(rawRate) && rawRate > 0 ? rawRate : 1;
      const convertedAmount = Math.round(amount * rate * 100) / 100;

      return {
        ...t,
        amount: -convertedAmount,
        fxRateApplied: rate,
      };
    });
}
