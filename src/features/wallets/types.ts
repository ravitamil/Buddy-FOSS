export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'wallet' | 'other';
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  isExcludedFromNetWorth?: boolean;
  lastUpdated?: Date;
}
