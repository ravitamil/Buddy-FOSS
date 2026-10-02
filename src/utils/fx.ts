import {FxRate, FxCacheEntry} from '../types/fx';

const fxCache = new Map<string, FxCacheEntry>();

function key(base: string, quote: string, date: string) {
  return `${base}:${quote}:${date.split('T')[0]}`;
}

export function setFxRate(rate: FxRate) {
  fxCache.set(key(rate.base, rate.quote, rate.date), {
    key: key(rate.base, rate.quote, rate.date),
    rate: rate.rate,
    updatedAt: new Date().toISOString(),
  });
}

export function getFxRate(base: string, quote: string, date: string): number | null {
  const entry = fxCache.get(key(base, quote, date));
  if (entry) return entry.rate;
  if (base === quote) return 1;
  return null;
}

export function convert(
  amount: number,
  from: string,
  to: string,
  date: string,
): {convertedAmount: number; rate: number} {
  if (from === to) return {convertedAmount: amount, rate: 1};
  const r = getFxRate(from, to, date);
  const rate = typeof r === 'number' ? r : 1;
  return {convertedAmount: Math.round(amount * rate * 100) / 100, rate};
}
