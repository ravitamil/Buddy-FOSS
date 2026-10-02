import type {InvestmentType} from '@/types';

export const investmentTypes: Array<{value: InvestmentType; label: string}> = [
  {value: 'stocks', label: 'Stocks & Equity'},
  {value: 'mutual_funds', label: 'Mutual Funds'},
  {value: 'fixed_deposits', label: 'Fixed Deposits'},
  {value: 'bonds', label: 'Bonds & Debentures'},
  {value: 'gold', label: 'Gold & Precious Metals'},
  {value: 'crypto', label: 'Cryptocurrency'},
  {value: 'real_estate', label: 'Real Estate'},
  {value: 'ppf', label: 'PPF'},
  {value: 'nps', label: 'NPS'},
  {value: 'insurance', label: 'Insurance'},
  {value: 'commodity', label: 'Commodities'},
  {value: 'cash', label: 'Cash & Savings'},
  {value: 'other', label: 'Other'},
];
