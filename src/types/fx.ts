export interface FxRate {
  base: string;
  quote: string;
  date: string; // ISO date
  rate: number;
}

export interface FxCacheEntry {
  key: string;
  rate: number;
  updatedAt: string;
}

export type FxSource = 'manual' | 'cached' | 'external';
