import dayjs from 'dayjs';

import type {LoanFormData} from '@/types/loan.types';
import {EMICalculationMethod} from '@/types/loan.types';
import {addPaymentPeriod} from '../calculations/datePeriods';
import type {PaymentFrequency} from '../calculations/types';
import {LOAN_TYPE_CONFIG, type LoanFormErrors} from '../types/addEditLoanForm';

export const createInitialLoanFormData = (initialData?: Partial<LoanFormData>): LoanFormData => {
  const loanType = initialData?.loanType ?? 'PERSONAL';

  return {
    name: initialData?.name ?? '',
    lenderName: initialData?.lenderName ?? '',
    principalAmount: initialData?.principalAmount ?? 0,
    interestRate: initialData?.interestRate ?? 0,
    tenure: initialData?.tenure ?? 12,
    emiAmount: initialData?.emiAmount ?? 0,
    startDate: initialData?.startDate ?? '',
    nextEmiDate: initialData?.nextEmiDate ?? '',
    sanctionDate: initialData?.sanctionDate ?? '',
    disbursementDate: initialData?.disbursementDate ?? '',
    firstEmiDate: initialData?.firstEmiDate ?? dayjs().add(1, 'month').format('YYYY-MM-DD'),
    loanType,
    lenderType: initialData?.lenderType ?? 'bank',
    calculationMethod: initialData?.calculationMethod ?? EMICalculationMethod.REDUCING_BALANCE,
    paymentFrequency: initialData?.paymentFrequency ?? 'MONTHLY',
    processingFee:
      initialData?.processingFee !== undefined
        ? initialData.processingFee
        : (initialData?.processingCharges ?? 0),
    prepaymentChargesPercentage: initialData?.prepaymentChargesPercentage ?? 0,
    lateFeePercentage: initialData?.lateFeePercentage ?? 0,
    otherCharges: initialData?.otherCharges ?? 0,
    loanAccountNumber: initialData?.loanAccountNumber ?? '',
    interestType: initialData?.interestType ?? 'FIXED',
    payoffStrategy: initialData?.payoffStrategy,
    extraPaymentAllocation: initialData?.extraPaymentAllocation ?? 0,
    customPayoffOrder: initialData?.customPayoffOrder,
    projectedPayoffDate: initialData?.projectedPayoffDate ?? '',
    interestSavings: initialData?.interestSavings ?? 0,
    reminderDaysBefore: initialData?.reminderDaysBefore ?? 3,
    reminderEnabled: initialData?.reminderEnabled ?? true,
    autoPayEnabled: initialData?.autoPayEnabled ?? false,
    borrowerName: initialData?.borrowerName,
    color: initialData?.color ?? LOAN_TYPE_CONFIG[loanType].color,
    icon: initialData?.icon ?? LOAN_TYPE_CONFIG[loanType].icon,
    totalAmount: initialData?.totalAmount ?? 0,
    totalInterest: initialData?.totalInterest ?? 0,
    currentOutstanding: initialData?.currentOutstanding ?? 0,
    outstandingBalance: initialData?.outstandingBalance ?? 0,
  };
};

export const calculateLoanFormTotals = ({
  emiAmount,
  tenure,
  principalAmount,
}: Pick<LoanFormData, 'emiAmount' | 'tenure' | 'principalAmount'>) => {
  const totalAmount = (emiAmount ?? 0) * (tenure ?? 0);
  const principal = principalAmount ?? 0;

  return {
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalAmount - principal),
    currentOutstanding: principal,
    outstandingBalance: principal,
  };
};

export const validateLoanForm = (formData: LoanFormData): LoanFormErrors => {
  const errors: LoanFormErrors = {};
  const loanType = formData.loanType ?? 'PERSONAL';
  const interestRate = formData.interestRate ?? 0;
  const tenure = formData.tenure ?? 0;

  if (!(formData.name ?? '').trim()) errors.name = 'Loan name is required';
  if ((formData.principalAmount ?? 0) <= 0) {
    errors.principalAmount = 'Principal amount must be greater than 0';
  }
  if (interestRate !== 0 && (interestRate < 0 || interestRate > 50)) {
    errors.interestRate = 'Interest rate must be between 0 and 50%';
  }
  if (tenure <= 0 || tenure > LOAN_TYPE_CONFIG[loanType].maxTenure) {
    errors.tenure = `Tenure must be between 1 and ${LOAN_TYPE_CONFIG[loanType].maxTenure} months`;
  }
  if ((formData.emiAmount ?? 0) <= 0) {
    errors.emiAmount = 'EMI amount must be greater than 0';
  }
  if (!(formData.lenderName ?? '').trim()) errors.lenderName = 'Lender name is required';
  if (!(formData.firstEmiDate ?? '').trim()) {
    errors.firstEmiDate = 'First EMI Date is required';
  }

  return errors;
};

const toIsoOrFallback = (date: string | undefined, fallback: string): string =>
  date ? new Date(date).toISOString() : fallback;

export const calculateUpcomingEmiDate = (
  firstEmiDate: string | Date,
  referenceDate: string | Date = new Date(),
  paymentFrequency: PaymentFrequency = 'MONTHLY',
): string => {
  const initialIso = toIsoOrFallback(
    typeof firstEmiDate === 'string' ? firstEmiDate : firstEmiDate.toISOString(),
    new Date().toISOString(),
  );
  const ref = dayjs(referenceDate).startOf('day');
  let nextEmi = dayjs(initialIso);
  if (!nextEmi.isBefore(ref, 'day')) {
    return initialIso;
  }
  while (nextEmi.isBefore(ref, 'day')) {
    nextEmi = addPaymentPeriod(nextEmi, 1, paymentFrequency);
  }
  return nextEmi.toISOString();
};

export const buildLoanSubmissionData = (formData: LoanFormData, now: string): LoanFormData => {
  const firstEmiIso = toIsoOrFallback(formData.firstEmiDate, now);
  const frequency: PaymentFrequency =
    formData.paymentFrequency === 'WEEKLY'
      ? 'MONTHLY'
      : (formData.paymentFrequency as PaymentFrequency) || 'MONTHLY';
  const calculatedNextEmiDate = formData.firstEmiDate
    ? calculateUpcomingEmiDate(formData.firstEmiDate, now, frequency)
    : firstEmiIso;

  return {
    ...formData,
    startDate: toIsoOrFallback(formData.disbursementDate || formData.firstEmiDate, now),
    nextEmiDate: calculatedNextEmiDate,
    firstEmiDate: firstEmiIso,
    sanctionDate: formData.sanctionDate ? new Date(formData.sanctionDate).toISOString() : '',
    disbursementDate: formData.disbursementDate
      ? new Date(formData.disbursementDate).toISOString()
      : '',
    createdAt: now,
    updatedAt: now,
  };
};
