import {Investment} from '../../types';
import {InvestmentHistory} from '../../types/index';

export function calculateInvestmentReturns(
  investment: Investment,
  history: InvestmentHistory[],
): number[] {
  const investmentHistory = history.find((item) => item.investmentId === investment.id);
  if (!investmentHistory || investmentHistory.history.length < 2) {
    return [];
  }

  const returns: number[] = [];
  for (let index = 1; index < investmentHistory.history.length; index++) {
    const previousValue = investmentHistory.history[index - 1].value;
    const currentValue = investmentHistory.history[index].value;
    if (previousValue > 0) {
      returns.push((currentValue - previousValue) / previousValue);
    }
  }

  return returns;
}

export function calculateVolatilityFromReturns(returns: number[]): number {
  if (returns.length === 0) {
    return 0;
  }

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const squaredDiffs = returns.map((value) => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / returns.length;
  return Math.sqrt(variance);
}

export function calculateSharpeRatioFromReturns(
  returns: number[],
  riskFreeRate: number = 0.02,
): number {
  if (returns.length === 0) {
    return 0;
  }

  const meanReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const volatility = calculateVolatilityFromReturns(returns);
  return volatility > 0 ? (meanReturn - riskFreeRate) / volatility : 0;
}
