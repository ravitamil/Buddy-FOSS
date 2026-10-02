import dayjs from 'dayjs';

import type {AmortizationEntry, PaymentRecord} from '@/types/loan.types';
import {addPaymentPeriod} from './datePeriods';
import type {EMICalculationMethod, PaymentFrequency} from './types';

export function generateAmortizationSchedule(params: {
  principal: number;
  emiAmount: number;
  annualInterestRate: number;
  tenureInMonths: number;
  calculationMethod: EMICalculationMethod;
  paymentFrequency: PaymentFrequency;
  startDate?: string;
}): AmortizationEntry[] {
  const {
    principal,
    emiAmount,
    annualInterestRate,
    tenureInMonths,
    startDate = dayjs().format('YYYY-MM-DD'),
  } = params;

  const schedule: AmortizationEntry[] = [];
  let outstandingBalance = principal;
  let currentDate = dayjs(startDate);
  const monthlyRate = annualInterestRate / 12 / 100;

  for (let installmentNumber = 1; installmentNumber <= tenureInMonths; installmentNumber++) {
    const interestComponent = monthlyRate === 0 ? 0 : outstandingBalance * monthlyRate;
    const principalComponent = monthlyRate === 0 ? emiAmount : emiAmount - interestComponent;

    outstandingBalance = Math.max(0, outstandingBalance - principalComponent);

    schedule.push({
      installmentNumber,
      emiAmount: parseFloat(emiAmount.toFixed(2)),
      principalComponent: parseFloat(principalComponent.toFixed(2)),
      interestComponent: parseFloat(interestComponent.toFixed(2)),
      outstandingBalance: parseFloat(outstandingBalance.toFixed(2)),
      paymentDate: currentDate.format('YYYY-MM-DD'),
      status: 'UPCOMING',
    });

    currentDate = currentDate.add(1, 'month');
  }

  return schedule;
}

export function calculateNextPaymentDate(
  startDate: Date,
  periodNumber: number,
  frequency: PaymentFrequency,
): Date;
export function calculateNextPaymentDate(
  startDate: string,
  periodNumber: number,
  frequency: PaymentFrequency,
): string;
export function calculateNextPaymentDate(
  startDate: string | Date,
  periodNumber: number,
  frequency: PaymentFrequency,
): string | Date {
  const nextDate = dayjs(startDate);
  const result = addPaymentPeriod(nextDate, periodNumber, frequency);

  return startDate instanceof Date ? result.toDate() : result.format('YYYY-MM-DD');
}

export function calculateMaturityDate(
  startDate: Date,
  tenureInMonths: number,
  paymentFrequency?: PaymentFrequency,
): Date;
export function calculateMaturityDate(
  startDate: string,
  tenureInMonths: number,
  paymentFrequency?: PaymentFrequency,
): string;
export function calculateMaturityDate(
  startDate: string | Date,
  tenureInMonths: number,
  paymentFrequency: PaymentFrequency = 'MONTHLY',
): string | Date {
  const result = addPaymentPeriod(dayjs(startDate), tenureInMonths, paymentFrequency);
  return startDate instanceof Date ? result.toDate() : result.format('YYYY-MM-DD');
}

export function calculateNextEMIDate(
  startDate: Date,
  paymentFrequency: PaymentFrequency,
  paymentHistory: PaymentRecord[] = [],
): Date {
  const currentDate = new Date();
  const paymentsMade = paymentHistory.filter(
    (payment) => payment.status === 'PAID' || payment.status === 'PARTIAL',
  ).length;
  let nextEMIDate = addPaymentPeriod(dayjs(startDate), paymentsMade + 1, paymentFrequency);

  while (nextEMIDate.toDate() <= currentDate) {
    nextEMIDate = addPaymentPeriod(nextEMIDate, 1, paymentFrequency);
  }

  return nextEMIDate.toDate();
}

export function getPeriodsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'MONTHLY':
      return 12;
    case 'QUARTERLY':
      return 4;
    case 'YEARLY':
      return 1;
    case 'WEEKLY':
    default:
      return 12;
  }
}

export function calculateOutstandingBalance(
  principal: number,
  emiAmount: number,
  annualInterestRate: number,
  totalTenure: number,
  paidInstallments: number,
  calculationMethod: EMICalculationMethod = 'REDUCING_BALANCE',
): number {
  if (paidInstallments >= totalTenure) {
    return 0;
  }

  const schedule = generateAmortizationSchedule({
    principal,
    emiAmount,
    annualInterestRate,
    tenureInMonths: totalTenure,
    calculationMethod,
    paymentFrequency: 'MONTHLY',
  });

  return (
    schedule.find((item) => item.installmentNumber === paidInstallments)?.outstandingBalance ?? 0
  );
}

export function updateAmortizationForRateChange(
  currentSchedule: AmortizationEntry[],
  newRate: number,
  recalculateFrom: number,
): AmortizationEntry[] {
  void newRate;
  void recalculateFrom;

  return [...currentSchedule];
}
