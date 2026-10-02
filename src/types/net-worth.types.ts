export interface Asset {
  id: string;
  name: string;
  type: 'investment' | 'savings' | 'wallet' | 'property' | 'vehicle' | 'other';
  category?: string;
  value: number;
  purchaseValue?: number;
  purchaseDate?: Date;
  lastUpdated: Date;
  appreciationRate?: number;
  linkedInvestmentId?: string;
  linkedSavingsGoalId?: string;
  linkedWalletId?: string;
}

export interface Liability {
  id: string;
  name: string;
  type: 'loan' | 'credit_card' | 'mortgage' | 'other';
  category?: string;
  currentValue: number;
  originalValue?: number;
  interestRate?: number;
  startDate?: Date;
  endDate?: Date;
  lastUpdated: Date;
  linkedLoanId?: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  netWorthChange: number;
  netWorthChangePercentage: number;
  assetBreakdown: {
    category: string;
    value: number;
    percentage: number;
  }[];
  liabilityBreakdown: {
    category: string;
    value: number;
    percentage: number;
  }[];
  debtToAssetRatio: number;
  lastUpdated: Date;
}

export interface NetWorthHistory {
  date: Date;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface NetWorthProjection {
  date: Date;
  projectedNetWorth: number;
  projectedAssets: number;
  projectedLiabilities: number;
  assumptions: {
    assetGrowthRate: number;
    liabilityReductionRate: number;
    annualSavings: number;
  };
}
