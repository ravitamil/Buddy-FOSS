import type {AdditionalPaymentState} from './loanDetailTypes';

export interface ParsedAdditionalPayment {
  amount: number | null;
  error: string | null;
}

export const createEmptyAdditionalPayment = (): AdditionalPaymentState => ({
  visible: false,
  amount: '',
  error: null,
});

export function parseAdditionalPaymentAmount(value: string): ParsedAdditionalPayment {
  const amount = Number.parseFloat(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {amount: null, error: 'Please enter a valid amount'};
  }

  return {amount, error: null};
}
