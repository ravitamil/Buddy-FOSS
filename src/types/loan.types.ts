// Loan types based on design documentation
export type LoanType =
  | 'HOME'
  | 'PERSONAL'
  | 'AUTO'
  | 'CREDIT_CARD'
  | 'EDUCATION'
  | 'BUSINESS'
  | 'OTHER';

export interface LoanData {
  id: string;
  name: string; // User-defined loan name
  lenderName: string; // Bank or financial institution name
  loanType: LoanType; // Home, Personal, Auto, Credit Card, etc.
  principalAmount: number; // Original loan amount (P)
  interestRate: number; // Annual interest rate (R)
  tenure: number; // Loan tenure in months (N)
  emiAmount: number; // Monthly EMI amount (E)
  startDate: string; // Loan start date
  nextEmiDate: string; // Next EMI due date
  disbursementDate?: string; // Loan disbursement date
  sanctionDate?: string; // Loan sanction date
  firstEmiDate?: string; // First EMI date
  paymentFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'; // Payment frequency
  status: 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
  currency: string; // Currency code (INR, USD, etc.)
  paymentHistory: PaymentRecord[]; // Payment records
  createdAt: string;
  updatedAt: string;
  // Additional fields
  processingCharges?: number; // Processing charges
  otherCharges?: number; // Other charges
  processingFee?: number; // Processing fee (distinct from processingCharges)
  prepaymentChargesPercentage?: number; // Prepayment charges percentage
  lateFeePercentage?: number; // Late fee percentage
  lenderType?: string; // Lender type (BANK, NBFC, etc.)
  interestType?: string; // Interest type (FIXED, FLOATING)
  calculationMethod?: string; // EMI calculation method (REDUCING, FLAT)
  // Calculated fields
  totalAmount: number; // Total amount to be paid (P + Interest)
  totalInterest: number; // Total interest over loan tenure
  currentOutstanding: number; // Current outstanding principal
  outstandingBalance: number; // Current outstanding balance (principal + pending interest)
  amortizationSchedule: AmortizationEntry[]; // Amortization schedule
  borrowerName?: string;
  loanAccountNumber?: string;
  reminderEnabled: boolean;
  autoPayEnabled: boolean;
  reminderDaysBefore?: number;
  interestDetails?: {currentRate: number; type?: string};
  color?: string;
  icon?: string;
  paymentRecords?: PaymentRecord[];

  // Debt payoff strategy fields
  payoffStrategy?: 'snowball' | 'avalanche' | 'snowflake' | 'custom';
  extraPaymentAllocation?: number;
  projectedPayoffDate?: string;
  interestSavings?: number;
  customPayoffOrder?: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'PARTIAL';
  method: string;
  note?: string;
  principalPaid: number;
  interestPaid: number;
  installmentNumber?: number;
  createdAt: string;
}

export interface AmortizationEntry {
  installmentNumber: number;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  outstandingBalance: number;
  paymentDate: string;
  status: 'PAID' | 'PENDING' | 'UPCOMING';
}

// Enums
export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  DEFAULTED = 'DEFAULTED',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export enum InterestType {
  FIXED = 'FIXED',
  FLOATING = 'FLOATING',
  HYBRID = 'HYBRID',
}

export enum EMICalculationMethod {
  REDUCING_BALANCE = 'REDUCING_BALANCE',
  FLAT_RATE = 'FLAT_RATE',
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
}

// Loan insights interface
export interface LoanInsights {
  remainingTenure: number;
  totalInterestPaid: number;
  totalInterestRemaining: number;
  nextEmiDate: string;
  outstandingBalance: number;
}

// Summary type
export interface LoanSummary {
  totalLoans: number;
  totalOutstanding: number;
  totalInterest: number;
  activeLoans: number;
}

// Form data types
export interface LoanFormData {
  id?: string;
  name?: string;
  lenderName?: string;
  loanType?: LoanType;
  principalAmount?: number;
  interestRate?: number;
  tenure?: number;
  emiAmount?: number;
  startDate?: string;
  nextEmiDate?: string;
  disbursementDate?: string;
  paymentFrequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  status?: 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
  currency?: string;
  paymentHistory?: PaymentRecord[];
  createdAt?: string;
  updatedAt?: string;
  processingCharges?: number;
  otherCharges?: number;
  lenderType?: string;
  interestType?: string;
  calculationMethod?: string;
  totalAmount?: number;
  totalInterest?: number;
  currentOutstanding?: number;
  outstandingBalance?: number;
  amortizationSchedule?: AmortizationEntry[];
  borrowerName?: string;
  reminderEnabled?: boolean;
  autoPayEnabled?: boolean;
  interestDetails?: {currentRate: number; type?: string};
  color?: string;
  icon?: string;
  paymentRecords?: PaymentRecord[];
  // Additional form-specific fields
  description?: string;
  reminderDaysBefore: number;
  sanctionDate?: string;
  firstEmiDate?: string;
  processingFee?: number;
  prepaymentChargesPercentage?: number;
  lateFeePercentage?: number;
  loanAccountNumber?: string;
  originalTenure?: number;
  // Debt payoff strategy form fields
  payoffStrategy?: 'snowball' | 'avalanche' | 'snowflake' | 'custom';
  extraPaymentAllocation?: number;
  customPayoffOrder?: number;
  projectedPayoffDate?: string;
  interestSavings?: number;
  charges?: {
    processingFee?: number;
    prepaymentCharges?: {
      percentage?: number;
    };
    lateFee?: {
      percentage?: number;
    };
  };
}

export type PaymentFormData = Partial<PaymentRecord>;
