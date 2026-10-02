import type {Investment} from '@/types';

export const getInvestmentTotalValue = (investments: Investment[]): number =>
  investments.reduce(
    (sum, investment) => sum + (investment.currentPrice || 0) * (investment.quantity || 0),
    0,
  );

export const getInvestmentTotalCost = (investments: Investment[]): number =>
  investments.reduce(
    (sum, investment) => sum + (investment.purchasePrice || 0) * (investment.quantity || 0),
    0,
  );

export const getInvestmentGainLoss = (
  investments: Investment[],
): {amount: number; percentage: number} => {
  const totalValue = getInvestmentTotalValue(investments);
  const totalCost = getInvestmentTotalCost(investments);
  const amount = totalValue - totalCost;
  const percentage = totalCost > 0 ? (amount / totalCost) * 100 : 0;
  return {amount, percentage};
};

export const applyMockInvestmentPriceUpdate = (investments: Investment[]): Investment[] =>
  investments.map((investment) => ({
    ...investment,
    currentPrice: (investment.currentPrice || 0) * (1 + (Math.random() * 0.02 - 0.01)),
    lastUpdated: new Date(),
  }));
