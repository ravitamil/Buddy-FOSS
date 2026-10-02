import type {InvestmentCategory, InvestmentType} from '@/types';

export interface StockData {
  symbol: string;
  name: string;
  type: InvestmentType;
  market: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  dividendYield?: number;
  volume: number;
  description: string;
  sector: string;
  industry: string;
  founded: number;
  employees: number;
  headquarters: string;
  website: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  market: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  time: string;
  excerpt: string;
  url: string;
  market: string;
  category: string;
}

export interface GlobalMarket {
  id: string;
  name: string;
  flag: string;
  currency: string;
  indices: Array<{name: string; symbol: string}>;
}

export type ResearchSortBy = 'symbol' | 'name' | 'price' | 'change' | 'volume' | 'marketCap';
export type ResearchSortOrder = 'asc' | 'desc';
export type InvestmentResearchCategory = InvestmentCategory;
