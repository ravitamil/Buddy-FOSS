import {
  calculateEMI,
  calculateEMIValue,
  calculateLoanMetrics,
  calculateRemainingTenure,
  generateAmortizationSchedule,
  normalizeLoanDates,
  recalculateLoanTerms,
} from './index';
import type {EnhancedLoan} from '../context/loanContextTypes';

const baseLoan: EnhancedLoan = {
  id: 'loan-1',
  name: 'Home Loan',
  lenderName: 'Test Bank',
  loanType: 'HOME',
  principalAmount: 120000,
  interestRate: 12,
  tenure: 12,
  emiAmount: 10000,
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  nextEmiDate: new Date('2026-02-01T00:00:00.000Z'),
  paymentFrequency: 'MONTHLY',
  status: 'ACTIVE',
  currency: 'INR',
  paymentHistory: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  totalAmount: 120000,
  totalInterest: 0,
  currentOutstanding: 120000,
  outstandingBalance: 120000,
  amortizationSchedule: [],
  reminderEnabled: true,
  autoPayEnabled: false,
};

describe('loan calculations', () => {
  it('calculates zero-interest reducing-balance EMI', () => {
    expect(calculateEMIValue(120000, 0, 12)).toBe(10000);

    const result = calculateEMI({
      principal: 120000,
      annualInterestRate: 0,
      tenureInMonths: 12,
    });

    expect(result.emiAmount).toBe(10000);
    expect(result.totalAmount).toBe(120000);
    expect(result.totalInterest).toBe(0);
  });

  it('calculates reducing-balance EMI and amortization schedule', () => {
    const result = calculateEMI({
      principal: 120000,
      annualInterestRate: 12,
      tenureInMonths: 12,
      calculationMethod: 'REDUCING_BALANCE',
    });

    expect(result.emiAmount).toBe(10661.85);
    expect(result.amortizationSchedule).toHaveLength(12);
    expect(result.amortizationSchedule[0]).toMatchObject({
      installmentNumber: 1,
      interestComponent: 1200,
      principalComponent: 9461.85,
    });
    expect(result.amortizationSchedule[11]?.outstandingBalance).toBeLessThanOrEqual(0.1);
  });

  it('generates an amortization schedule with expected length and final balance', () => {
    const schedule = generateAmortizationSchedule({
      principal: 120000,
      emiAmount: 10000,
      annualInterestRate: 0,
      tenureInMonths: 12,
      calculationMethod: 'REDUCING_BALANCE',
      paymentFrequency: 'MONTHLY',
      startDate: '2026-01-01',
    });

    expect(schedule).toHaveLength(12);
    expect(schedule[0]?.paymentDate).toBe('2026-01-01');
    expect(schedule[11]).toMatchObject({
      installmentNumber: 12,
      outstandingBalance: 0,
      status: 'UPCOMING',
    });
  });

  it('calculates remaining tenure and display metrics from a fixed current date', () => {
    const today = new Date('2026-07-15T00:00:00.000Z');

    expect(calculateRemainingTenure(12, '2026-01-01', today)).toBe(6);

    const metrics = calculateLoanMetrics(
      {
        id: 'loan-1',
        lenderName: 'Test Bank',
        emiAmount: 10000,
        tenure: 12,
        startDate: '2026-01-01',
      },
      today,
    );

    expect(metrics).toMatchObject({
      totalAmount: 120000,
      completedTenure: 6,
      remainingTenure: 6,
      maturityDate: '2027-01-01',
      remainingAmount: 60000,
      paidAmount: 60000,
      progressPercentage: 50,
      isLoanCompleted: false,
    });
  });

  it('recalculates loan context terms while preserving date-normalized loan shape', () => {
    const recalculated = recalculateLoanTerms(baseLoan);
    const normalized = normalizeLoanDates({
      ...recalculated,
      startDate: '2026-01-01T00:00:00.000Z' as unknown as Date,
      nextEmiDate: '2026-02-01T00:00:00.000Z' as unknown as Date,
    });

    expect(recalculated.emiAmount).toBe(10661.85);
    expect(recalculated.amortizationSchedule).toHaveLength(12);
    expect(normalized.startDate).toBeInstanceOf(Date);
    expect(normalized.nextEmiDate).toBeInstanceOf(Date);
  });
});
