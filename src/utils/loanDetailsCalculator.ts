import {LoanData, AmortizationEntry, PaymentRecord, LoanType} from '../types/loan.types';
import {generateAmortizationSchedule} from '@/features/loans/calculations';
import {generateEntityId} from '../types/context-foundation';

/**
 * Interface for the real-time loan details provided by the user
 */
export interface RealTimeLoanDetails {
  date: string;
  lender: string;
  borrower: string;
  loanType: string;

  // Financial Details
  loanAmountDisbursed: number;
  totalInterest: number;
  totalRepayment: number;

  // Processing Charges
  processingFees: number;
  insuranceCharges: number;
  netDisbursedAmount: number;

  // Interest Rate and Terms
  apr: number;
  loanTenure: number;
  repaymentFrequency: string;
  numberOfInstallments: number;
  monthlyEMI: number;

  // Additional Charges and Penalties
  penaltyCharges: number;

  // Important Terms
  coolingOffPeriod: number;
}

/**
 * Calculate loan data based on real-time loan details
 * @param details The real-time loan details provided by the user
 * @returns Calculated LoanData object
 */
export function calculateLoanFromDetails(details: RealTimeLoanDetails): LoanData {
  // Calculate principal amount (loan amount disbursed)
  const principalAmount = details.loanAmountDisbursed;

  // Calculate effective interest rate (APR)
  const interestRate = details.apr;

  // Tenure in months
  const tenure = details.loanTenure;

  // EMI amount
  const emiAmount = details.monthlyEMI;

  // Generate amortization schedule
  const amortizationSchedule: AmortizationEntry[] = generateAmortizationSchedule({
    principal: principalAmount,
    emiAmount: emiAmount,
    annualInterestRate: interestRate,
    tenureInMonths: tenure,
    calculationMethod: 'REDUCING_BALANCE',
    paymentFrequency: 'MONTHLY',
    startDate: details.date,
  });

  // Create payment history (initially empty)
  const paymentHistory: PaymentRecord[] = [];

  // Create the LoanData object
  const loanData: LoanData = {
    id: generateLoanId(),
    name: `${details.loanType} Loan from ${details.lender}`,
    lenderName: details.lender,
    loanType: getLoanTypeFromString(details.loanType),
    principalAmount: principalAmount,
    interestRate: interestRate,
    tenure: tenure,
    emiAmount: emiAmount,
    startDate: details.date,
    nextEmiDate: calculateNextEMIDate(details.date),
    paymentFrequency: 'MONTHLY',
    status: 'ACTIVE',
    currency: 'INR',
    paymentHistory: paymentHistory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalAmount: details.totalRepayment,
    totalInterest: details.totalInterest,
    currentOutstanding: principalAmount,
    outstandingBalance: details.totalRepayment,
    amortizationSchedule: amortizationSchedule,
    borrowerName: details.borrower,
    reminderEnabled: true,
    autoPayEnabled: false,
    interestDetails: {currentRate: interestRate},
    color: generateLoanColor(),
    icon: 'card-outline',
  };

  return loanData;
}

/**
 * Generate a unique loan ID
 * @returns A unique loan ID string
 */
function generateLoanId(): string {
  return generateEntityId();
}

/**
 * Convert loan type string to LoanType enum
 * @param loanTypeString The loan type as a string
 * @returns LoanType enum value
 */
function getLoanTypeFromString(loanTypeString: string): LoanType {
  const normalizedType = loanTypeString.toLowerCase();

  if (normalizedType.includes('personal')) return 'PERSONAL';
  if (normalizedType.includes('home')) return 'HOME';
  if (normalizedType.includes('auto')) return 'AUTO';
  if (normalizedType.includes('credit')) return 'CREDIT_CARD';
  if (normalizedType.includes('education')) return 'EDUCATION';
  if (normalizedType.includes('business')) return 'BUSINESS';

  return 'OTHER';
}

/**
 * Calculate the next EMI date based on the start date
 * @param startDate The loan start date
 * @returns The next EMI date in YYYY-MM-DD format
 */
function calculateNextEMIDate(startDate: string): string {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
}

/**
 * Generate a random color for the loan
 * @returns A color string
 */
function generateLoanColor(): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Validate the loan details
 * @param details The loan details to validate
 * @returns Validation result with isValid flag and errors array
 */
export function validateLoanDetails(details: RealTimeLoanDetails): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (details.loanAmountDisbursed <= 0) {
    errors.push('Loan amount disbursed must be greater than zero');
  }

  if (details.apr < 0) {
    errors.push('APR cannot be negative');
  }

  if (details.loanTenure <= 0) {
    errors.push('Loan tenure must be greater than zero');
  }

  if (details.monthlyEMI <= 0) {
    errors.push('Monthly EMI must be greater than zero');
  }

  if (details.totalRepayment <= 0) {
    errors.push('Total repayment amount must be greater than zero');
  }

  if (details.totalInterest < 0) {
    errors.push('Total interest cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
