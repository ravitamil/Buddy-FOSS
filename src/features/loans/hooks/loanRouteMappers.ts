import type {LoanFormData} from '@/types/loan.types';
import type {EnhancedLoan} from '../context/loanContextTypes';

type LoanDraft = Omit<EnhancedLoan, 'id'>;

const toIsoString = (value: Date | string | undefined): string | undefined =>
  value instanceof Date ? value.toISOString() : value;

export const toLoanFormData = (loan: EnhancedLoan): Partial<LoanFormData> => ({
  ...loan,
  startDate: toIsoString(loan.startDate),
  nextEmiDate: toIsoString(loan.nextEmiDate),
  disbursementDate: toIsoString(loan.disbursementDate),
  sanctionDate: toIsoString(loan.sanctionDate),
  firstEmiDate: toIsoString(loan.firstEmiDate),
  projectedPayoffDate: toIsoString(loan.projectedPayoffDate),
  createdAt: toIsoString(loan.createdAt),
  updatedAt: toIsoString(loan.updatedAt),
});

export const toLoanDraft = (data: LoanFormData): LoanDraft => ({
  name: data.name ?? '',
  lenderName: data.lenderName ?? '',
  loanType: data.loanType ?? 'PERSONAL',
  principalAmount: data.principalAmount ?? 0,
  interestRate: data.interestRate ?? 0,
  tenure: data.tenure ?? 0,
  emiAmount: data.emiAmount ?? 0,
  startDate: data.startDate ? new Date(data.startDate) : new Date(),
  nextEmiDate: data.nextEmiDate
    ? new Date(data.nextEmiDate)
    : data.firstEmiDate
      ? new Date(data.firstEmiDate)
      : new Date(),
  disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : undefined,
  sanctionDate: data.sanctionDate ? new Date(data.sanctionDate) : undefined,
  firstEmiDate: data.firstEmiDate ? new Date(data.firstEmiDate) : undefined,
  paymentFrequency: data.paymentFrequency ?? 'MONTHLY',
  status: data.status ?? 'ACTIVE',
  currency: data.currency ?? 'INR',
  paymentHistory: data.paymentHistory ?? [],
  createdAt: data.createdAt ?? new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalAmount: data.totalAmount ?? 0,
  totalInterest: data.totalInterest ?? 0,
  currentOutstanding: data.currentOutstanding ?? 0,
  outstandingBalance: data.outstandingBalance ?? 0,
  amortizationSchedule: data.amortizationSchedule ?? [],
  processingCharges: data.charges?.processingFee ?? data.processingCharges ?? 0,
  otherCharges:
    (data.charges?.prepaymentCharges?.percentage ?? 0) + (data.charges?.lateFee?.percentage ?? 0) ||
    data.otherCharges ||
    0,
  lenderType: data.lenderType ?? 'bank',
  borrowerName: data.borrowerName ?? '',
  loanAccountNumber: data.loanAccountNumber ?? '',
  reminderEnabled: data.reminderEnabled ?? false,
  autoPayEnabled: data.autoPayEnabled ?? false,
  reminderDaysBefore: data.reminderDaysBefore ?? 3,
  interestDetails: data.interestDetails,
  color: data.color ?? '#8B5CF6',
  icon: data.icon ?? 'person',
  interestType: data.interestType ?? '',
  payoffStrategy: data.payoffStrategy,
  extraPaymentAllocation: data.extraPaymentAllocation ?? 0,
  customPayoffOrder: data.customPayoffOrder,
  projectedPayoffDate: data.projectedPayoffDate ? new Date(data.projectedPayoffDate) : undefined,
  interestSavings: data.interestSavings ?? 0,
});
