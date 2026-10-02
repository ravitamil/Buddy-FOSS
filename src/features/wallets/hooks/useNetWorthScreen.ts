import {useCallback, useEffect, useMemo, useState} from 'react';

import {useAuth} from '@/context/AuthContext';
import {useSettings} from '@/context/SettingsContext';
import type {NetWorthProjection, NetWorthSummary} from '@/types';
import {useInvestments} from '@/features/investments/queries';
import {useLoans} from '@/features/loans/queries';
import {useSavings} from '@/features/savings/queries';
import {NetWorthService} from '@/services/NetWorthService';
import {CurrencyService} from '@/services/CurrencyService';

import {buildCanonicalPortfolioSnapshot} from './netWorthPortfolioModel';
import {useWallets} from '../queries';

export type NetWorthPeriod = '1Y' | '3Y' | '5Y' | '10Y';

export interface NetWorthChartDatum {
  text: string;
  value: number;
  color: string;
}

export interface NetWorthHistoryData {
  data: number[];
  labels: string[];
}

export interface DebtHealthInfo {
  status: 'healthy' | 'moderate' | 'high';
  label: string;
  color: string;
  description: string;
}

export interface UseNetWorthScreenResult {
  selectedPeriod: NetWorthPeriod;
  setSelectedPeriod: (period: NetWorthPeriod) => void;
  formatCurrency: (amount: number) => string;
  netWorthSummary: NetWorthSummary;
  assets: ReturnType<NetWorthService['getAssets']>;
  liabilities: ReturnType<NetWorthService['getLiabilities']>;
  netWorthProjections: NetWorthProjection[];
  netWorthHistoryData: NetWorthHistoryData;
  assetBreakdownData: NetWorthChartDatum[];
  liabilityBreakdownData: NetWorthChartDatum[];
  getColorForCategory: (category: string) => string;
  projectedTarget: number;
  projectedGrowth: number;
  projectedGrowthPercentage: number;
  debtHealth: DebtHealthInfo;
}

const EMPTY_NET_WORTH_SUMMARY: NetWorthSummary = {
  netWorth: 0,
  netWorthChange: 0,
  netWorthChangePercentage: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  debtToAssetRatio: 0,
  assetBreakdown: [],
  liabilityBreakdown: [],
  lastUpdated: new Date(0),
};

const CATEGORY_COLORS = {
  Wallets: '#5C7CFA',
  Investments: '#4ECDC4',
  Savings: '#45B7D1',
  Loans: '#FF6B6B',
  'Other Assets': '#A0DAA9',
  'Other Liabilities': '#DDA0DD',
} as const;

export const useNetWorthScreen = (): UseNetWorthScreenResult => {
  const {user} = useAuth();
  const userId = user?.uid ?? '';
  const {currency: baseCurrency, formatCurrency} = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState<NetWorthPeriod>('1Y');
  const [rates, setRates] = useState<Record<string, number> | undefined>(undefined);

  const {data: wallets = []} = useWallets(userId);
  const {data: investments = []} = useInvestments(userId);
  const {data: savingsGoals = []} = useSavings(userId);
  const {data: loans = []} = useLoans(userId);
  const netWorthService = useMemo(() => new NetWorthService(), []);

  useEffect(() => {
    let isMounted = true;
    if (baseCurrency) {
      CurrencyService.getRates(baseCurrency)
        .then((fetchedRates) => {
          if (isMounted) setRates(fetchedRates);
        })
        .catch(() => {
          // Graceful offline fallback
        });
    }
    return () => {
      isMounted = false;
    };
  }, [baseCurrency]);

  const getColorForCategory = useCallback((category: string): string => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? '#9B59B6';
  }, []);

  const snapshot = useMemo(() => {
    if (!userId) {
      return {
        assets: [],
        liabilities: [],
        summary: EMPTY_NET_WORTH_SUMMARY,
      };
    }

    return buildCanonicalPortfolioSnapshot({
      wallets,
      investments,
      savingsGoals,
      loans,
      baseCurrency,
      rates,
      netWorthService,
    });
  }, [baseCurrency, investments, loans, netWorthService, rates, savingsGoals, userId, wallets]);

  const netWorthProjections = useMemo(() => {
    return netWorthService.projectNetWorthGrowth(
      snapshot.summary.netWorth,
      snapshot.summary.totalAssets,
      snapshot.summary.totalLiabilities,
      10,
      0.07,
      0.05,
      12000,
    );
  }, [netWorthService, snapshot.summary]);

  const netWorthHistoryData = useMemo<NetWorthHistoryData>(() => {
    const current = Math.round(snapshot.summary.netWorth);
    const currentAssets = snapshot.summary.totalAssets;
    const currentLiabilities = snapshot.summary.totalLiabilities;

    if (selectedPeriod === '1Y') {
      const qRate = 0.07 / 4;
      const qLiabRate = 0.05 / 4;
      const qSavings = 12000 / 4;

      let a = currentAssets;
      let l = currentLiabilities;
      const data = [current];
      const labels = ['Now', 'Q1', 'Q2', 'Q3', '1Y'];

      for (let i = 1; i <= 4; i += 1) {
        a = a * (1 + qRate) + qSavings;
        l = Math.max(0, l * (1 - qLiabRate));
        data.push(Math.round(a - l));
      }
      return {data, labels};
    }

    if (selectedPeriod === '3Y') {
      const data = [current];
      const labels = ['Now', '1Y', '2Y', '3Y'];
      for (let i = 0; i < Math.min(3, netWorthProjections.length); i += 1) {
        data.push(Math.round(netWorthProjections[i].projectedNetWorth));
      }
      return {data, labels};
    }

    if (selectedPeriod === '5Y') {
      const data = [current];
      const labels = ['Now', '1Y', '2Y', '3Y', '4Y', '5Y'];
      for (let i = 0; i < Math.min(5, netWorthProjections.length); i += 1) {
        data.push(Math.round(netWorthProjections[i].projectedNetWorth));
      }
      return {data, labels};
    }

    // 10Y horizon
    const data = [current];
    const labels = ['Now', '2Y', '4Y', '6Y', '8Y', '10Y'];
    const indices = [1, 3, 5, 7, 9];
    indices.forEach((idx) => {
      if (netWorthProjections[idx]) {
        data.push(Math.round(netWorthProjections[idx].projectedNetWorth));
      }
    });
    return {data, labels};
  }, [netWorthProjections, selectedPeriod, snapshot.summary]);

  const projectedTarget = useMemo(() => {
    const len = netWorthHistoryData.data.length;
    return len > 0 ? netWorthHistoryData.data[len - 1] : snapshot.summary.netWorth;
  }, [netWorthHistoryData.data, snapshot.summary.netWorth]);

  const projectedGrowth = useMemo(() => {
    return projectedTarget - snapshot.summary.netWorth;
  }, [projectedTarget, snapshot.summary.netWorth]);

  const projectedGrowthPercentage = useMemo(() => {
    if (snapshot.summary.netWorth === 0) return 0;
    return (projectedGrowth / Math.abs(snapshot.summary.netWorth)) * 100;
  }, [projectedGrowth, snapshot.summary.netWorth]);

  const debtHealth = useMemo<DebtHealthInfo>(() => {
    const ratio = snapshot.summary.debtToAssetRatio;
    if (ratio < 0.3) {
      return {
        status: 'healthy',
        label: 'Low Debt',
        color: '#4CAF50',
        description: 'Debt is under 30% of assets. Excellent financial cushion.',
      };
    }
    if (ratio < 0.5) {
      return {
        status: 'moderate',
        label: 'Moderate Debt',
        color: '#FF9800',
        description: 'Debt is between 30%–50% of assets. Maintain steady payoff.',
      };
    }
    return {
      status: 'high',
      label: 'High Debt',
      color: '#FF5722',
      description: 'Debt exceeds 50% of assets. Prioritize paying down liabilities.',
    };
  }, [snapshot.summary.debtToAssetRatio]);

  const assetBreakdownData = useMemo<NetWorthChartDatum[]>(
    () =>
      snapshot.summary.assetBreakdown.map((item) => ({
        text: item.category,
        value: item.value,
        color: getColorForCategory(item.category),
      })),
    [getColorForCategory, snapshot.summary.assetBreakdown],
  );

  const liabilityBreakdownData = useMemo<NetWorthChartDatum[]>(
    () =>
      snapshot.summary.liabilityBreakdown.map((item) => ({
        text: item.category,
        value: item.value,
        color: getColorForCategory(item.category),
      })),
    [getColorForCategory, snapshot.summary.liabilityBreakdown],
  );

  return {
    selectedPeriod,
    setSelectedPeriod,
    formatCurrency,
    netWorthSummary: snapshot.summary,
    assets: snapshot.assets,
    liabilities: snapshot.liabilities,
    netWorthProjections,
    netWorthHistoryData,
    assetBreakdownData,
    liabilityBreakdownData,
    getColorForCategory,
    projectedTarget,
    projectedGrowth,
    projectedGrowthPercentage,
    debtHealth,
  };
};
