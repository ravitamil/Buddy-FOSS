export type CategoryType = 'income' | 'expense' | 'investment';
export type InvestmentRiskLevel = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  description?: string;
  riskLevel?: InvestmentRiskLevel;
  expectedReturn?: number;
  isSystem?: boolean;
}

export interface InvestmentCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type?: 'investment';
  description?: string;
  riskLevel: InvestmentRiskLevel;
  expectedReturn?: number;
  isSystem?: boolean;
}

export interface SpendingLimit {
  id: string;
  categoryId: string;
  limit: number;
  period: 'daily' | 'weekly' | 'monthly';
  currentSpent: number;
}
