import type {InvestmentCategory} from './category.types';

export type InvestmentType =
  | 'stocks'
  | 'mutual_funds'
  | 'fixed_deposits'
  | 'bonds'
  | 'gold'
  | 'crypto'
  | 'real_estate'
  | 'ppf'
  | 'nps'
  | 'insurance'
  | 'commodity'
  | 'cash'
  | 'other';

export interface Investment {
  id: string;
  name: string;
  category: InvestmentCategory;
  type: InvestmentType;
  amount: number;
  purchaseAmount: number;
  purchaseDate: Date;
  quantity?: number;
  currentPrice?: number;
  purchasePrice?: number;
  symbol?: string;
  platform?: string;
  notes?: string;
  isActive: boolean;
  currency: string;
  categoryId: string;
  portfolioId?: string;
  lastUpdated: Date;
  createdAt: Date;
  linkedSavingsGoalId?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  investments: Investment[];
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  returnPercentage: number;
  lastUpdated: Date;
  createdAt: Date;
  isDefault: boolean;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  returnPercentage: number;
  monthlyGrowth: number;
  categoryAllocation: CategoryAllocation[];
  topPerformers: Investment[];
  underPerformers: Investment[];
  riskDistribution: RiskDistribution;
  monthlyTrends: PortfolioTrend[];
}

export interface CategoryAllocation {
  category: InvestmentCategory;
  value: number;
  percentage: number;
  count: number;
  averageReturn: number;
}

export interface RiskDistribution {
  low: {value: number; percentage: number; count: number};
  medium: {value: number; percentage: number; count: number};
  high: {value: number; percentage: number; count: number};
}

export interface PortfolioTrend {
  month: string;
  year: number;
  value: number;
  returns: number;
  returnPercentage: number;
}

export interface InvestmentHistory {
  investmentId: string;
  history: {
    date: Date;
    value: number;
    quantity?: number;
    price?: number;
  }[];
  benchmarks?: {
    date: Date;
    value: number;
    benchmark: string;
  }[];
  riskMetrics?: {
    date: Date;
    volatility: number;
    maxDrawdown: number;
    sharpeRatio: number;
  }[];
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: 'buy' | 'sell' | 'dividend' | 'interest' | 'bonus' | 'split';
  quantity: number;
  price: number;
  amount: number;
  fees?: number;
  date: Date;
  notes?: string;
  linkedTransactionId?: string;
}
