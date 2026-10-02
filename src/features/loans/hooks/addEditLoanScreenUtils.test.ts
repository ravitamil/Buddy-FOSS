import {EMICalculationMethod} from '@/types/loan.types';
import {
  buildLoanSubmissionData,
  calculateLoanFormTotals,
  createInitialLoanFormData,
  validateLoanForm,
} from './addEditLoanScreenUtils';

describe('addEditLoanScreenUtils', () => {
  it('creates defaults while preserving legacy processing charges', () => {
    const formData = createInitialLoanFormData({
      loanType: 'HOME',
      processingCharges: 1250,
    });

    expect(formData).toMatchObject({
      loanType: 'HOME',
      processingFee: 1250,
      calculationMethod: EMICalculationMethod.REDUCING_BALANCE,
      color: '#3B82F6',
      icon: 'home-outline',
      tenure: 12,
    });
  });

  it('calculates rounded totals from EMI, tenure, and principal', () => {
    expect(
      calculateLoanFormTotals({
        emiAmount: 1050.4,
        tenure: 10,
        principalAmount: 9000,
      }),
    ).toEqual({
      totalAmount: 10504,
      totalInterest: 1504,
      currentOutstanding: 9000,
      outstandingBalance: 9000,
    });
  });

  it('returns field errors for invalid required loan values', () => {
    const formData = createInitialLoanFormData({
      name: ' ',
      lenderName: '',
      principalAmount: 0,
      interestRate: 51,
      tenure: 85,
      emiAmount: 0,
      firstEmiDate: '',
      loanType: 'PERSONAL',
    });

    expect(validateLoanForm(formData)).toEqual({
      name: 'Loan name is required',
      principalAmount: 'Principal amount must be greater than 0',
      interestRate: 'Interest rate must be between 0 and 50%',
      tenure: 'Tenure must be between 1 and 84 months',
      emiAmount: 'EMI amount must be greater than 0',
      lenderName: 'Lender name is required',
      firstEmiDate: 'First EMI Date is required',
    });
  });

  it('normalizes submission dates without changing other fields', () => {
    const formData = createInitialLoanFormData({
      name: 'Car',
      firstEmiDate: '2026-07-15',
      sanctionDate: '2026-06-01',
      disbursementDate: '',
    });

    expect(buildLoanSubmissionData(formData, '2026-06-21T00:00:00.000Z')).toMatchObject({
      name: 'Car',
      startDate: '2026-07-15T00:00:00.000Z',
      nextEmiDate: '2026-07-15T00:00:00.000Z',
      firstEmiDate: '2026-07-15T00:00:00.000Z',
      sanctionDate: '2026-06-01T00:00:00.000Z',
      disbursementDate: '',
      createdAt: '2026-06-21T00:00:00.000Z',
      updatedAt: '2026-06-21T00:00:00.000Z',
    });
  });

  it('rolls forward past firstEmiDate to upcoming date', () => {
    const formData = createInitialLoanFormData({
      name: 'Old Loan',
      firstEmiDate: '2023-10-10',
      paymentFrequency: 'MONTHLY',
    });

    const submission = buildLoanSubmissionData(formData, '2026-09-08T00:00:00.000Z');
    expect(submission.firstEmiDate).toBe('2023-10-10T00:00:00.000Z');
    expect(new Date(submission.nextEmiDate).getTime()).toBeGreaterThanOrEqual(
      new Date('2026-09-08T00:00:00.000Z').getTime(),
    );
  });
});
