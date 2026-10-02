export interface SpendingHistory {
  category: string;
  monthlyAmounts: {[month: string]: number};
  averageAmount: number;
  variance: number;
}

export interface FinancialGoal {
  targetSavings: number;
  timeline: number;
  currentProgress: number;
}

export interface BudgetHealthScore {
  score: number;
  status: string;
  recommendations: string[];
}

export interface SpendingPrediction {
  predicted: number;
  confidence: number;
  range: {
    min: number;
    max: number;
  };
}
