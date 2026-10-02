import type {Wallet} from '@/features/wallets/types';
import type {
  Asset,
  Liability,
  NetWorthHistory,
  NetWorthProjection,
  NetWorthSummary,
} from '../types';
import type {Investment, SavingsGoal} from '../types';
import type {LoanData} from '../types/loan.types';

export interface NetWorthInput {
  wallets: Wallet[];
  investments: Investment[];
  savingsGoals: SavingsGoal[];
  loans: LoanData[];
  otherAssets?: Asset[];
  otherLiabilities?: Liability[];
  baseCurrency?: string;
  rates?: Record<string, number>;
}

export interface AssetInput {
  wallets: Wallet[];
  investments: Investment[];
  savingsGoals: SavingsGoal[];
  otherAssets?: Asset[];
  baseCurrency?: string;
  rates?: Record<string, number>;
}

export interface LiabilityInput {
  loans: LoanData[];
  otherLiabilities?: Liability[];
  baseCurrency?: string;
  rates?: Record<string, number>;
}

const WALLET_ASSET_TYPES = new Set<Wallet['type']>(['cash', 'bank', 'wallet', 'other']);

const getWalletCategoryLabel = (walletType: Wallet['type']): string => {
  switch (walletType) {
    case 'cash':
      return 'Cash';
    case 'bank':
      return 'Bank';
    case 'wallet':
      return 'Wallet';
    default:
      return 'Other';
  }
};

export function convertAmountToCurrency(
  amount: number,
  fromCurrency: string | undefined,
  baseCurrency: string | undefined,
  rates?: Record<string, number>,
): number {
  if (!amount || !fromCurrency || !baseCurrency || !rates) {
    return amount;
  }

  const from = fromCurrency.toUpperCase();
  const base = baseCurrency.toUpperCase();

  if (from === base) {
    return amount;
  }

  const fromRate = rates[from];
  if (fromRate && fromRate > 0) {
    return amount / fromRate;
  }

  return amount;
}

export class NetWorthService {
  calculateNetWorth({
    wallets,
    investments,
    savingsGoals,
    loans,
    otherAssets = [],
    otherLiabilities = [],
    baseCurrency,
    rates,
  }: NetWorthInput): NetWorthSummary {
    const walletAssets = wallets
      .filter((wallet) => WALLET_ASSET_TYPES.has(wallet.type) && !wallet.isExcludedFromNetWorth)
      .reduce((sum, wallet) => {
        const converted = convertAmountToCurrency(
          wallet.balance,
          wallet.currency,
          baseCurrency,
          rates,
        );
        return sum + converted;
      }, 0);

    const investmentAssets = investments
      .filter((investment) => investment.isActive)
      .reduce((sum, investment) => {
        const converted = convertAmountToCurrency(
          investment.amount,
          investment.currency,
          baseCurrency,
          rates,
        );
        return sum + converted;
      }, 0);

    const savingsAssets = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const otherAssetValue = otherAssets.reduce((sum, asset) => sum + asset.value, 0);
    const totalAssets = walletAssets + investmentAssets + savingsAssets + otherAssetValue;

    const loanLiabilities = loans
      .filter((loan) => loan.status === 'ACTIVE')
      .reduce((sum, loan) => {
        const converted = convertAmountToCurrency(
          loan.outstandingBalance,
          loan.currency,
          baseCurrency,
          rates,
        );
        return sum + converted;
      }, 0);

    const otherLiabilityValue = otherLiabilities.reduce(
      (sum, liability) => sum + liability.currentValue,
      0,
    );
    const totalLiabilities = loanLiabilities + otherLiabilityValue;
    const netWorth = totalAssets - totalLiabilities;

    const assetBreakdown = [
      {
        category: 'Wallets',
        value: walletAssets,
        percentage: totalAssets > 0 ? (walletAssets / totalAssets) * 100 : 0,
      },
      {
        category: 'Investments',
        value: investmentAssets,
        percentage: totalAssets > 0 ? (investmentAssets / totalAssets) * 100 : 0,
      },
      {
        category: 'Savings',
        value: savingsAssets,
        percentage: totalAssets > 0 ? (savingsAssets / totalAssets) * 100 : 0,
      },
      {
        category: 'Other Assets',
        value: otherAssetValue,
        percentage: totalAssets > 0 ? (otherAssetValue / totalAssets) * 100 : 0,
      },
    ].filter((item) => item.value > 0);

    const liabilityBreakdown = [
      {
        category: 'Loans',
        value: loanLiabilities,
        percentage: totalLiabilities > 0 ? (loanLiabilities / totalLiabilities) * 100 : 0,
      },
      {
        category: 'Other Liabilities',
        value: otherLiabilityValue,
        percentage: totalLiabilities > 0 ? (otherLiabilityValue / totalLiabilities) * 100 : 0,
      },
    ].filter((item) => item.value > 0);

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      netWorthChange: 0,
      netWorthChangePercentage: 0,
      assetBreakdown,
      liabilityBreakdown,
      debtToAssetRatio: totalAssets > 0 ? totalLiabilities / totalAssets : 0,
      lastUpdated: new Date(),
    };
  }

  getNetWorthHistory(userId: string): NetWorthHistory[] {
    void userId;
    return [];
  }

  projectNetWorthGrowth(
    currentNetWorth: number,
    currentAssets: number,
    currentLiabilities: number,
    years: number,
    assetGrowthRate: number = 0.07,
    liabilityReductionRate: number = 0.05,
    annualSavings: number = 0,
  ): NetWorthProjection[] {
    const projections: NetWorthProjection[] = [];
    let projectedAssets = currentAssets;
    let projectedLiabilities = currentLiabilities;

    for (let i = 1; i <= years; i += 1) {
      projectedAssets = projectedAssets * (1 + assetGrowthRate) + annualSavings;
      projectedLiabilities = Math.max(0, projectedLiabilities * (1 - liabilityReductionRate));

      projections.push({
        date: new Date(new Date().getFullYear() + i, 0, 1),
        projectedNetWorth: projectedAssets - projectedLiabilities,
        projectedAssets,
        projectedLiabilities,
        assumptions: {
          assetGrowthRate,
          liabilityReductionRate,
          annualSavings,
        },
      });
    }

    return projections;
  }

  getAssets({
    wallets,
    investments,
    savingsGoals,
    otherAssets = [],
    baseCurrency,
    rates,
  }: AssetInput): Asset[] {
    const walletAssets: Asset[] = wallets
      .filter((wallet) => WALLET_ASSET_TYPES.has(wallet.type) && !wallet.isExcludedFromNetWorth)
      .map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        type: 'wallet',
        category: getWalletCategoryLabel(wallet.type),
        value: convertAmountToCurrency(wallet.balance, wallet.currency, baseCurrency, rates),
        lastUpdated: wallet.lastUpdated ?? new Date(),
        linkedWalletId: wallet.id,
      }));

    const investmentAssets: Asset[] = investments
      .filter((investment) => investment.isActive)
      .map((investment) => ({
        id: investment.id,
        name: investment.name,
        type: 'investment',
        category: investment.category.name,
        value: convertAmountToCurrency(investment.amount, investment.currency, baseCurrency, rates),
        purchaseValue: investment.purchaseAmount,
        purchaseDate: investment.purchaseDate,
        lastUpdated: investment.lastUpdated,
        appreciationRate: investment.category.expectedReturn
          ? investment.category.expectedReturn / 100
          : 0,
        linkedInvestmentId: investment.id,
      }));

    const savingsAssets: Asset[] = savingsGoals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      type: 'savings',
      category: goal.category,
      value: goal.currentAmount,
      lastUpdated: goal.updatedAt ?? goal.createdAt ?? new Date(),
      linkedSavingsGoalId: goal.id,
    }));

    return [...walletAssets, ...investmentAssets, ...savingsAssets, ...otherAssets];
  }

  getLiabilities({loans, otherLiabilities = [], baseCurrency, rates}: LiabilityInput): Liability[] {
    const loanLiabilities: Liability[] = loans
      .filter((loan) => loan.status === 'ACTIVE')
      .map((loan) => ({
        id: loan.id,
        name: loan.name,
        type: 'loan',
        category: loan.loanType,
        currentValue: convertAmountToCurrency(
          loan.outstandingBalance,
          loan.currency,
          baseCurrency,
          rates,
        ),
        originalValue: loan.principalAmount,
        interestRate: loan.interestRate,
        startDate: new Date(loan.startDate),
        endDate: loan.tenure
          ? new Date(
              new Date(loan.startDate).setMonth(new Date(loan.startDate).getMonth() + loan.tenure),
            )
          : undefined,
        lastUpdated: new Date(loan.updatedAt),
        linkedLoanId: loan.id,
      }));

    return [...loanLiabilities, ...otherLiabilities];
  }
}
