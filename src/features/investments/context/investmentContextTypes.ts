import type {Investment, InvestmentCategory} from '@/types';

export interface InvestmentContextType {
  investments: Investment[];
  investmentCategories: InvestmentCategory[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;

  addInvestment: (
    investment: Omit<Investment, 'id' | 'lastUpdated' | 'createdAt'>,
  ) => Promise<Investment>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<Investment>;
  deleteInvestment: (id: string) => Promise<void>;
  addInvestmentCategory: (category: Omit<InvestmentCategory, 'id'>) => Promise<InvestmentCategory>;
  updateInvestmentCategory: (
    id: string,
    updates: Partial<InvestmentCategory>,
  ) => Promise<InvestmentCategory>;
  deleteInvestmentCategory: (id: string) => Promise<void>;

  getInvestmentById: (id: string) => Investment | undefined;
  getTotalValue: () => number;
  getTotalCost: () => number;
  getTotalGainLoss: () => {amount: number; percentage: number};

  syncWithRemote: () => Promise<void>;
  updatePrices: () => Promise<void>;
}
