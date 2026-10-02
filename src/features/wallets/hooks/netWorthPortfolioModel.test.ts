import {buildCanonicalPortfolioSnapshot} from './netWorthPortfolioModel';

describe('buildCanonicalPortfolioSnapshot', () => {
  it('builds net worth from wallets, investments, savings, and loans', () => {
    const snapshot = buildCanonicalPortfolioSnapshot({
      wallets: [
        {
          id: 'wallet-cash',
          name: 'Cash Wallet',
          type: 'cash',
          balance: 1200,
          currency: 'USD',
        },
        {
          id: 'wallet-hidden',
          name: 'Hidden Wallet',
          type: 'bank',
          balance: 9999,
          currency: 'USD',
          isExcludedFromNetWorth: true,
        },
      ],
      investments: [
        {
          id: 'investment-1',
          name: 'Index Fund',
          category: {
            id: 'cat-1',
            name: 'Equity',
            icon: 'trending-up',
            color: '#00FF00',
            description: 'Equity',
            riskLevel: 'medium',
            expectedReturn: 10,
            isSystem: false,
          },
          type: 'stocks',
          amount: 3000,
          purchaseAmount: 2500,
          purchaseDate: new Date('2026-01-01T00:00:00.000Z'),
          isActive: true,
          currency: 'USD',
          categoryId: 'cat-1',
          lastUpdated: new Date('2026-07-01T00:00:00.000Z'),
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      savingsGoals: [
        {
          id: 'goal-1',
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 2000,
          deadline: new Date('2027-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-07-01T00:00:00.000Z'),
        },
      ],
      loans: [
        {
          id: 'loan-1',
          name: 'Car Loan',
          lenderName: 'Bank',
          loanType: 'AUTO',
          principalAmount: 10000,
          interestRate: 8,
          tenure: 24,
          emiAmount: 450,
          startDate: '2026-01-01T00:00:00.000Z',
          nextEmiDate: '2026-08-01T00:00:00.000Z',
          paymentFrequency: 'MONTHLY',
          status: 'ACTIVE',
          currency: 'USD',
          paymentHistory: [],
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-07-01T00:00:00.000Z',
          totalAmount: 10800,
          totalInterest: 800,
          currentOutstanding: 6000,
          outstandingBalance: 6000,
          amortizationSchedule: [],
          reminderEnabled: false,
          autoPayEnabled: false,
        },
      ],
    });

    expect(snapshot.summary.totalAssets).toBe(6200);
    expect(snapshot.summary.totalLiabilities).toBe(6000);
    expect(snapshot.summary.netWorth).toBe(200);
    expect(snapshot.summary.assetBreakdown.map((item) => item.category)).toEqual(
      expect.arrayContaining(['Wallets', 'Investments', 'Savings']),
    );
    expect(snapshot.summary.liabilityBreakdown.map((item) => item.category)).toEqual(['Loans']);
    expect(snapshot.assets.some((asset) => asset.linkedWalletId === 'wallet-hidden')).toBe(false);
    expect(snapshot.liabilities.some((liability) => liability.type === 'loan')).toBe(true);
  });

  it('converts foreign currency wallet balances using exchange rates', () => {
    const snapshot = buildCanonicalPortfolioSnapshot({
      wallets: [
        {
          id: 'wallet-usd',
          name: 'USD Cash',
          type: 'cash',
          balance: 100,
          currency: 'USD',
        },
        {
          id: 'wallet-eur',
          name: 'EUR Bank',
          type: 'bank',
          balance: 90, // 90 EUR with rate 0.9 = 100 USD
          currency: 'EUR',
        },
      ],
      investments: [],
      savingsGoals: [],
      loans: [],
      baseCurrency: 'USD',
      rates: {
        USD: 1.0,
        EUR: 0.9,
      },
    });

    expect(snapshot.summary.totalAssets).toBe(200);
    expect(snapshot.summary.netWorth).toBe(200);
  });
});
