import {NetWorthService} from '@/services/NetWorthService';
import type {Investment, SavingsGoal} from '@/types';
import type {LoanData} from '@/types/loan.types';
import type {Wallet} from '../types';

export interface CanonicalPortfolioSnapshot {
  assets: ReturnType<NetWorthService['getAssets']>;
  liabilities: ReturnType<NetWorthService['getLiabilities']>;
  summary: ReturnType<NetWorthService['calculateNetWorth']>;
}

interface CanonicalPortfolioInput {
  wallets: Wallet[];
  investments: Investment[];
  savingsGoals: SavingsGoal[];
  loans: LoanData[];
  baseCurrency?: string;
  rates?: Record<string, number>;
  netWorthService?: NetWorthService;
}

export function buildCanonicalPortfolioSnapshot({
  wallets,
  investments,
  savingsGoals,
  loans,
  baseCurrency,
  rates,
  netWorthService = new NetWorthService(),
}: CanonicalPortfolioInput): CanonicalPortfolioSnapshot {
  const summary = netWorthService.calculateNetWorth({
    wallets,
    investments,
    savingsGoals,
    loans,
    baseCurrency,
    rates,
  });
  const assets = netWorthService.getAssets({
    wallets,
    investments,
    savingsGoals,
    baseCurrency,
    rates,
  });
  const liabilities = netWorthService.getLiabilities({
    loans,
    baseCurrency,
    rates,
  });

  return {
    assets,
    liabilities,
    summary,
  };
}
