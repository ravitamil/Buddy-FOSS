import React from 'react';
import {render} from '@testing-library/react-native';

import {NetWorthHeroCard} from './NetWorthHeroCard';
import {NetWorthQuickActionsCard} from './NetWorthQuickActionsCard';
import {NetWorthHoldingsCard} from './NetWorthHoldingsCard';
import {NetWorthAllocationCard} from './NetWorthAllocationCard';
import type {DebtHealthInfo} from '../hooks/useNetWorthScreen';
import type {NetWorthSummary} from '@/types';

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: jest.fn(() => ({isDarkMode: false})),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('react-native-gifted-charts', () => ({
  LineChart: 'LineChart',
  PieChart: 'PieChart',
}));

const mockSummary: NetWorthSummary = {
  netWorth: 45000,
  netWorthChange: 1200,
  netWorthChangePercentage: 2.7,
  totalAssets: 60000,
  totalLiabilities: 15000,
  debtToAssetRatio: 0.25,
  assetBreakdown: [
    {category: 'Wallets', value: 20000, percentage: 33.3},
    {category: 'Investments', value: 40000, percentage: 66.7},
  ],
  liabilityBreakdown: [{category: 'Loans', value: 15000, percentage: 100}],
  lastUpdated: new Date(),
};

const mockDebtHealth: DebtHealthInfo = {
  status: 'healthy',
  label: 'Low Debt',
  color: '#4CAF50',
  description: 'Debt is under 30% of assets. Excellent financial cushion.',
};

describe('Net Worth Components', () => {
  const formatCurrency = (amt: number) => `$${amt.toLocaleString()}`;

  describe('NetWorthHeroCard', () => {
    it('renders net worth, assets, and liabilities amounts correctly', () => {
      const {getByText, getByTestId} = render(
        <NetWorthHeroCard
          summary={mockSummary}
          formatCurrency={formatCurrency}
          assetCount={3}
          liabilityCount={1}
          debtHealth={mockDebtHealth}
        />,
      );

      expect(getByTestId('net-worth-hero-card')).toBeTruthy();
      expect(getByText('TOTAL NET WORTH')).toBeTruthy();
      expect(getByText('$45,000')).toBeTruthy();
      expect(getByText('$60,000')).toBeTruthy();
      expect(getByText('$15,000')).toBeTruthy();
      expect(getByText('Low Debt')).toBeTruthy();
      expect(getByText('25.0%')).toBeTruthy();
    });
  });

  describe('NetWorthQuickActionsCard', () => {
    it('renders all 4 financial quick actions', () => {
      const {getByText} = render(<NetWorthQuickActionsCard />);

      expect(getByText('Add Investment')).toBeTruthy();
      expect(getByText('Add Goal')).toBeTruthy();
      expect(getByText('Add Loan')).toBeTruthy();
      expect(getByText('Analytics')).toBeTruthy();
    });
  });

  describe('NetWorthHoldingsCard', () => {
    it('renders asset and liability holdings with filter options', () => {
      const mockAssets = [
        {
          id: 'asset-1',
          name: 'Main Checking',
          type: 'wallet' as const,
          category: 'Bank',
          value: 20000,
          lastUpdated: new Date(),
        },
      ];
      const mockLiabilities = [
        {
          id: 'liab-1',
          name: 'Car Loan',
          type: 'loan' as const,
          category: 'Auto',
          currentValue: 15000,
          lastUpdated: new Date(),
        },
      ];

      const {getByText} = render(
        <NetWorthHoldingsCard
          assets={mockAssets}
          liabilities={mockLiabilities}
          formatCurrency={formatCurrency}
        />,
      );

      expect(getByText('Main Checking')).toBeTruthy();
      expect(getByText('Car Loan')).toBeTruthy();
      expect(getByText('All (2)')).toBeTruthy();
      expect(getByText('Assets (1)')).toBeTruthy();
      expect(getByText('Liabilities (1)')).toBeTruthy();
    });
  });

  describe('NetWorthAllocationCard', () => {
    it('renders asset allocation breakdown by default', () => {
      const assetData = [
        {text: 'Wallets', value: 20000, color: '#5C7CFA'},
        {text: 'Investments', value: 40000, color: '#4ECDC4'},
      ];
      const liabilityData = [{text: 'Loans', value: 15000, color: '#FF6B6B'}];

      const {getByText} = render(
        <NetWorthAllocationCard
          summary={mockSummary}
          assetChartData={assetData}
          liabilityChartData={liabilityData}
          formatCurrency={formatCurrency}
          getColorForCategory={(cat) => (cat === 'Wallets' ? '#5C7CFA' : '#4ECDC4')}
        />,
      );

      expect(getByText('Portfolio Allocation')).toBeTruthy();
      expect(getByText('Wallets')).toBeTruthy();
      expect(getByText('Investments')).toBeTruthy();
      expect(getByText('33.3%')).toBeTruthy();
      expect(getByText('66.7%')).toBeTruthy();
    });
  });
});
