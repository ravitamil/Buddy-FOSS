import type {CRUDOperations} from '@/types/context-foundation';
import type {AmortizationEntry, LoanData, PaymentRecord} from '@/types/loan.types';

type LoanDataWithDateObjects = Omit<
  LoanData,
  | 'startDate'
  | 'nextEmiDate'
  | 'disbursementDate'
  | 'sanctionDate'
  | 'firstEmiDate'
  | 'projectedPayoffDate'
  | 'paymentFrequency'
>;

export interface EnhancedLoan extends LoanDataWithDateObjects {
  name: string;
  lenderName: string;
  loanType: 'HOME' | 'PERSONAL' | 'AUTO' | 'CREDIT_CARD' | 'EDUCATION' | 'BUSINESS' | 'OTHER';
  principalAmount: number;
  interestRate: number;
  tenure: number;
  emiAmount: number;
  startDate: Date;
  nextEmiDate: Date;
  disbursementDate?: Date;
  sanctionDate?: Date;
  firstEmiDate?: Date;
  paymentFrequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  status: 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
  currency: string;
  paymentHistory: PaymentRecord[];
  totalAmount: number;
  totalInterest: number;
  currentOutstanding: number;
  outstandingBalance: number;
  amortizationSchedule: AmortizationEntry[];
  reminderEnabled: boolean;
  autoPayEnabled: boolean;
  processingCharges?: number;
  otherCharges?: number;
  processingFee?: number;
  prepaymentChargesPercentage?: number;
  lateFeePercentage?: number;
  lenderType?: string;
  interestType?: string;
  calculationMethod?: string;
  interestDetails?: {currentRate: number; type?: string};
  color?: string;
  icon?: string;
  borrowerName?: string;
  loanAccountNumber?: string;
  reminderDaysBefore?: number;
  payoffStrategy?: 'snowball' | 'avalanche' | 'snowflake' | 'custom';
  extraPaymentAllocation?: number;
  projectedPayoffDate?: Date;
  interestSavings?: number;
  customPayoffOrder?: number;
}

export interface LoanContextType {
  loans: CRUDOperations<EnhancedLoan>;
  addLoan: (loan: Omit<EnhancedLoan, 'id'>) => Promise<EnhancedLoan>;
  updateLoan: (id: string, updates: Partial<EnhancedLoan>) => Promise<EnhancedLoan>;
  deleteLoan: (id: string) => Promise<void>;

  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;

  getLoanById: (id: string) => EnhancedLoan | null;
  recordLoanPayment: (loanId: string, payment: Omit<PaymentRecord, 'id'>) => Promise<void>;
  calculateEMI: (principal: number, annualRate: number, tenureMonths: number) => number;
  generateAmortizationSchedule: (loan: EnhancedLoan) => AmortizationEntry[];
  getTotalLoanDebt: () => number;
  getTotalMonthlyEMI: () => number;
  getActiveLoans: () => EnhancedLoan[];
  getClosedLoans: () => EnhancedLoan[];
  getLoansByType: (type: EnhancedLoan['loanType']) => EnhancedLoan[];
  calculateInterestSavings: (loanId: string, extraPayment: number) => number;
  refreshLoans: () => Promise<void>;
}
