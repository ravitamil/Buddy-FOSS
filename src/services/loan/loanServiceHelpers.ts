import type {LoanData, LoanSummary, LoanType, PaymentRecord} from '../../types/loan.types';
import {generateEntityId} from '../../types/context-foundation';
import {calculateLoanMetrics, calculateNextEMIDate} from '@/features/loans/calculations';

type LoanTypeConfig = {
  displayName: string;
  maxTenure: number;
  color: string;
  icon: string;
};

const loanTypeConfig: Record<LoanType, LoanTypeConfig> = {
  HOME: {displayName: 'Home Loan', maxTenure: 360, color: '#3B82F6', icon: 'home-outline'},
  PERSONAL: {displayName: 'Personal Loan', maxTenure: 84, color: '#8B5CF6', icon: 'person-outline'},
  AUTO: {displayName: 'Car Loan', maxTenure: 84, color: '#10B981', icon: 'car-outline'},
  EDUCATION: {
    displayName: 'Education Loan',
    maxTenure: 180,
    color: '#F59E0B',
    icon: 'school-outline',
  },
  BUSINESS: {
    displayName: 'Business Loan',
    maxTenure: 120,
    color: '#EF4444',
    icon: 'briefcase-outline',
  },
  CREDIT_CARD: {displayName: 'Credit Card', maxTenure: 60, color: '#6366F1', icon: 'card-outline'},
  OTHER: {displayName: 'Other', maxTenure: 120, color: '#6B7280', icon: 'ellipsis-horizontal'},
};

export const enhanceLoanWithTypeConfig = (loan: LoanData): LoanData => {
  const config = loanTypeConfig[loan.loanType] || loanTypeConfig.OTHER;
  return {
    ...loan,
    color: loan.color || config.color,
    icon: loan.icon || config.icon,
  };
};

export const enhanceLoansWithTypeConfig = (loans: LoanData[]): LoanData[] =>
  loans.map(enhanceLoanWithTypeConfig);

export const buildNewLoan = (loanData: Partial<LoanData>): LoanData => {
  const loanType = loanData.loanType || 'PERSONAL';
  const config = loanTypeConfig[loanType] || loanTypeConfig.OTHER;
  const now = new Date().toISOString();

  return {
    id: loanData.id || generateEntityId(),
    name: loanData.name || 'Untitled Loan',
    lenderName: loanData.lenderName || '',
    loanType,
    principalAmount: loanData.principalAmount || 0,
    interestRate: loanData.interestRate || 0,
    tenure: loanData.tenure || 0,
    emiAmount: loanData.emiAmount || 0,
    startDate: loanData.startDate || loanData.firstEmiDate || now,
    nextEmiDate: loanData.nextEmiDate || calculateInitialNextEmiDate(loanData),
    paymentFrequency: loanData.paymentFrequency || 'MONTHLY',
    reminderEnabled: loanData.reminderEnabled || false,
    autoPayEnabled: loanData.autoPayEnabled || false,
    status: loanData.status || 'ACTIVE',
    currency: loanData.currency || 'INR',
    paymentHistory: loanData.paymentHistory || [],
    createdAt: now,
    updatedAt: now,
    color: loanData.color || config.color,
    icon: loanData.icon || config.icon,
    totalAmount:
      (loanData.principalAmount || 0) +
      (loanData.processingCharges || 0) +
      (loanData.otherCharges || 0),
    totalInterest:
      (loanData.emiAmount || 0) * (loanData.tenure || 0) - (loanData.principalAmount || 0),
    currentOutstanding: loanData.principalAmount || 0,
    outstandingBalance: (loanData.emiAmount || 0) * (loanData.tenure || 0),
    amortizationSchedule: [],
    processingCharges: loanData.processingCharges || 0,
    otherCharges: loanData.otherCharges || 0,
    ...optionalLoanFields(loanData),
  };
};

export const buildPaymentRecord = (payment: Partial<PaymentRecord>): PaymentRecord => ({
  id: generateEntityId(),
  amount: payment.amount || 0,
  date: payment.date || new Date().toISOString(),
  status: payment.status || 'PAID',
  method: payment.method || 'manual',
  note: payment.note,
  principalPaid: payment.principalPaid || 0,
  interestPaid: payment.interestPaid || 0,
  createdAt: new Date().toISOString(),
});

export const calculateOutstandingBalanceForLoan = (loan: LoanData): number => {
  const paidAmount = (loan.paymentHistory || [])
    .filter((payment) => payment.status === 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return Math.max(0, loan.totalAmount - paidAmount);
};

export const getLoanSummaryFromLoans = (loans: LoanData[]): LoanSummary => {
  const activeLoans = loans.filter((loan) => loan.status === 'ACTIVE');
  return {
    totalLoans: loans.length,
    totalOutstanding: activeLoans.reduce((sum, loan) => sum + (loan.outstandingBalance || 0), 0),
    totalInterest: activeLoans.reduce((sum, loan) => sum + (loan.totalInterest || 0), 0),
    activeLoans: activeLoans.length,
  };
};

export const getUpcomingPaymentsFromLoans = (
  loans: LoanData[],
  days: number,
): Array<{
  loan: LoanData;
  nextPaymentDate: string;
  nextPaymentAmount: number;
}> => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return loans
    .filter((loan) => loan.status === 'ACTIVE')
    .flatMap((loan) => {
      const nextEmiDate = new Date(loan.nextEmiDate);
      return nextEmiDate >= now && nextEmiDate <= futureDate
        ? [{loan, nextPaymentDate: loan.nextEmiDate, nextPaymentAmount: loan.emiAmount}]
        : [];
    });
};

export const buildLoanReportSummary = (loan: LoanData, paymentHistory: PaymentRecord[]) => {
  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  return {
    totalPaid,
    remainingBalance: Math.max(0, loan.totalAmount - totalPaid),
    interestPaid: paymentHistory.reduce((sum, payment) => sum + payment.interestPaid, 0),
    principalPaid: paymentHistory.reduce((sum, payment) => sum + payment.principalPaid, 0),
    paymentsCount: paymentHistory.length,
  };
};

export const validateLoanDataFields = (loanData: Partial<LoanData>): string[] => {
  const errors: string[] = [];

  if (!loanData.name?.trim()) errors.push('Loan name is required');
  if (!loanData.lenderName?.trim()) errors.push('Lender name is required');
  if (!loanData.principalAmount || loanData.principalAmount <= 0) {
    errors.push('Principal amount must be greater than zero');
  }
  if ((loanData.interestRate || 0) < 0) errors.push('Interest rate cannot be negative');
  if (!loanData.tenure || loanData.tenure <= 0) {
    errors.push('Loan tenure is required and must be greater than zero');
  }
  if (!loanData.emiAmount || loanData.emiAmount <= 0) {
    errors.push('EMI amount is required and must be greater than zero');
  }
  if (loanData.nextEmiDate && new Date(loanData.nextEmiDate) < startOfToday()) {
    errors.push('Next EMI date must be in the future');
  }

  addCompletedLoanValidationError(loanData, errors);
  return errors;
};

const calculateInitialNextEmiDate = (loanData: Partial<LoanData>): string => {
  if (!loanData.firstEmiDate) {
    return new Date().toISOString().split('T')[0];
  }

  return calculateNextEMIDate(
    new Date(loanData.firstEmiDate),
    loanData.paymentFrequency === 'WEEKLY' ? 'MONTHLY' : loanData.paymentFrequency || 'MONTHLY',
    loanData.paymentHistory || [],
  )
    .toISOString()
    .split('T')[0];
};

const optionalLoanFields = (loanData: Partial<LoanData>): Partial<LoanData> => ({
  ...(loanData.disbursementDate && {disbursementDate: loanData.disbursementDate}),
  ...(loanData.sanctionDate && {sanctionDate: loanData.sanctionDate}),
  ...(loanData.firstEmiDate && {firstEmiDate: loanData.firstEmiDate}),
  ...(loanData.borrowerName && {borrowerName: loanData.borrowerName}),
  ...(loanData.loanAccountNumber && {loanAccountNumber: loanData.loanAccountNumber}),
  ...(loanData.interestType && {interestType: loanData.interestType}),
  ...(loanData.lenderType && {lenderType: loanData.lenderType}),
  ...(loanData.calculationMethod && {calculationMethod: loanData.calculationMethod}),
  ...(typeof loanData.processingFee !== 'undefined' && {processingFee: loanData.processingFee}),
  ...(typeof loanData.prepaymentChargesPercentage !== 'undefined' && {
    prepaymentChargesPercentage: loanData.prepaymentChargesPercentage,
  }),
  ...(typeof loanData.lateFeePercentage !== 'undefined' && {
    lateFeePercentage: loanData.lateFeePercentage,
  }),
  ...(typeof loanData.reminderDaysBefore !== 'undefined' && {
    reminderDaysBefore: loanData.reminderDaysBefore,
  }),
  ...(loanData.interestDetails && {interestDetails: loanData.interestDetails}),
  ...(loanData.payoffStrategy && {payoffStrategy: loanData.payoffStrategy}),
  ...(loanData.extraPaymentAllocation && {extraPaymentAllocation: loanData.extraPaymentAllocation}),
  ...(loanData.projectedPayoffDate && {projectedPayoffDate: loanData.projectedPayoffDate}),
  ...(loanData.interestSavings && {interestSavings: loanData.interestSavings}),
  ...(loanData.customPayoffOrder && {customPayoffOrder: loanData.customPayoffOrder}),
});

const startOfToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const addCompletedLoanValidationError = (loanData: Partial<LoanData>, errors: string[]): void => {
  if (!loanData.firstEmiDate || !loanData.tenure || !loanData.emiAmount) {
    return;
  }

  const metrics = calculateLoanMetrics({
    id: loanData.id ?? 'validation-loan',
    lenderName: loanData.lenderName ?? '',
    emiAmount: loanData.emiAmount,
    tenure: loanData.tenure,
    startDate: loanData.firstEmiDate,
  });

  if (metrics.isLoanCompleted) {
    const maturityDate = new Date(metrics.maturityDate).toLocaleDateString();
    const monthsOverdue = metrics.completedTenure - loanData.tenure;
    errors.push(
      `This loan has already completed its tenure. ` +
        `Maturity date was ${maturityDate}, which is ${monthsOverdue} months ago. ` +
        `Cannot add a loan that has already finished.`,
    );
  }
};
