import {generateAmortizationSchedule} from './amortization';
import type {EMICalculationInput, EMICalculationResult, PaymentFrequency} from './types';

export const calculateEMIValue = (
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number => {
  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) {
    throw new Error('Invalid loan parameters for EMI calculation');
  }

  return calculateReducingBalanceEMI(principal, annualRate, tenureMonths);
};

export function calculateReducingBalanceEMI(
  principal: number,
  annualInterestRate: number,
  tenureInMonths: number,
  paymentFrequency: PaymentFrequency = 'MONTHLY',
): number {
  void paymentFrequency;

  if (principal <= 0 || tenureInMonths <= 0) {
    return 0;
  }

  const monthlyRate = annualInterestRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / tenureInMonths;
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureInMonths)) /
    (Math.pow(1 + monthlyRate, tenureInMonths) - 1);

  return parseFloat(emi.toFixed(2));
}

export function calculateFlatRateEMI(
  principal: number,
  annualInterestRate: number,
  tenureInMonths: number,
  paymentFrequency: PaymentFrequency = 'MONTHLY',
): number {
  void paymentFrequency;

  if (principal <= 0 || tenureInMonths <= 0) {
    return 0;
  }

  const totalInterest = principal * (annualInterestRate / 100) * (tenureInMonths / 12);
  const totalAmount = principal + totalInterest;
  return parseFloat((totalAmount / tenureInMonths).toFixed(2));
}

export function calculateEMI(input: EMICalculationInput): EMICalculationResult {
  const {
    principal,
    annualInterestRate,
    tenureInMonths,
    calculationMethod = 'REDUCING_BALANCE',
  } = input;

  const emiAmount =
    calculationMethod === 'FLAT_RATE'
      ? calculateFlatRateEMI(principal, annualInterestRate, tenureInMonths)
      : calculateReducingBalanceEMI(principal, annualInterestRate, tenureInMonths);

  const totalAmount = emiAmount * tenureInMonths;

  return {
    emiAmount,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalInterest: parseFloat((totalAmount - principal).toFixed(2)),
    amortizationSchedule: generateAmortizationSchedule({
      principal,
      emiAmount,
      annualInterestRate,
      tenureInMonths,
      calculationMethod,
      paymentFrequency: input.paymentFrequency || 'MONTHLY',
    }),
  };
}
