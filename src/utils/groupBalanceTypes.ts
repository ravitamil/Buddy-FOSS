import type {MemberDebt, SettlementSuggestion} from '../types';

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  complexityScore: number;
  cacheHitRate: number;
  memberCount: number;
  transactionCount: number;
}

export interface CalculationCache {
  [hash: string]: {
    result: GroupBalanceCalculation;
    timestamp: number;
    dependencies: {
      transactionHash: string;
      memberHash: string;
    };
    metrics: PerformanceMetrics;
  };
}

export const GROUP_BALANCE_PERFORMANCE_CONFIG = {
  MAX_CACHE_SIZE: 50,
  CACHE_TTL: 5 * 60 * 1000,
  LARGE_GROUP_THRESHOLD: 15,
  HEAVY_CALCULATION_THRESHOLD: 1000,
  ENABLE_ASYNC_PROCESSING: true,
  CHUNK_SIZE: 10,
};

export interface MemberBalance {
  memberId: string;
  memberName: string;
  balance: number;
  totalPaid: number;
  totalOwed: number;
  percentageOfTotalExpenses: number;
  outstandingDebts: MemberDebt[];
  creditedAmounts: MemberDebt[];
  creditBalance: number;
  advancePayments: Record<string, number>;
}

export interface GroupBalanceCalculation {
  totalExpenses: number;
  totalPayments: number;
  netBalance: number;
  memberCount: number;
  transactionCount: number;
  averageExpensePerMember: number;
  memberBalances: MemberBalance[];
  debtMatrix: Record<string, Record<string, number>>;
  settlementSuggestions: SettlementSuggestion[];
  performanceMetrics: PerformanceMetrics;
  isCached: boolean;
}
