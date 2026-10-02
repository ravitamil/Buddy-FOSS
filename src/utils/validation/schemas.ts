export type ValidationErrorMap = Record<string, string | undefined>;

export function validateExpense(input: {
  description: string;
  amount: string | number;
  categoryId?: string;
  splitMethod?: 'equal' | 'custom' | 'percentage' | 'shares';
  splitDetails?: Record<string, number>;
  membersCount?: number;
}): {valid: boolean; errors: ValidationErrorMap} {
  const errors: ValidationErrorMap = {};
  const description = (input.description || '').trim();
  const amountNum = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;

  if (!description) errors.description = 'Description is required';
  if (!Number.isFinite(amountNum) || amountNum <= 0)
    errors.amount = 'Enter a valid amount greater than 0';

  if (input.splitMethod === 'custom' && input.splitDetails) {
    const sum = Object.values(input.splitDetails).reduce((s, v) => s + (Number(v) || 0), 0);
    if (Math.abs(sum - (amountNum || 0)) > 0.01)
      errors.splitDetails = 'Custom split must equal total amount';
  }

  if (input.splitMethod === 'percentage' && input.splitDetails) {
    const sumPct = Object.values(input.splitDetails).reduce((s, v) => s + (Number(v) || 0), 0);
    if (Math.round(sumPct) !== 100) errors.splitDetails = 'Percentages must add up to 100%';
  }

  if (input.splitMethod === 'shares' && input.splitDetails) {
    const sumShares = Object.values(input.splitDetails).reduce((s, v) => s + (Number(v) || 0), 0);
    if (sumShares <= 0) errors.splitDetails = 'Total shares must be greater than 0';
  }

  return {valid: Object.values(errors).every((e) => !e), errors};
}

export function validatePayment(input: {
  description?: string;
  amount: string | number;
  paidBy: string;
  receivedBy: string[];
}): {valid: boolean; errors: ValidationErrorMap} {
  const errors: ValidationErrorMap = {};
  const amountNum = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;

  if (!input.paidBy) errors.paidBy = 'Select payer';
  if (!input.receivedBy || input.receivedBy.length === 0)
    errors.receivedBy = 'Select at least one recipient';
  if (input.receivedBy && input.receivedBy.length > 1)
    errors.receivedBy = 'Select only one recipient for pairwise settlement';
  if (!Number.isFinite(amountNum) || amountNum <= 0)
    errors.amount = 'Enter a valid amount greater than 0';

  return {valid: Object.values(errors).every((e) => !e), errors};
}

export function validateSplits(
  method: 'equal' | 'custom' | 'percentage' | 'shares',
  total: number,
  details: Record<string, string | number>,
  membersCount: number,
): {valid: boolean; errors: ValidationErrorMap} {
  const errors: ValidationErrorMap = {};
  if (membersCount <= 0) {
    errors.members = 'No members to split with';
    return {valid: false, errors};
  }

  if (method === 'equal') return {valid: true, errors};

  const numericDetails: Record<string, number> = {};
  Object.entries(details).forEach(
    ([k, v]) => (numericDetails[k] = typeof v === 'string' ? parseFloat(v) || 0 : v),
  );

  if (method === 'custom') {
    const sum = Object.values(numericDetails).reduce((s, v) => s + v, 0);
    if (Math.abs(sum - total) > 0.01) errors.splitDetails = 'Custom amounts must sum to total';
  }

  if (method === 'percentage') {
    const sumPct = Object.values(numericDetails).reduce((s, v) => s + v, 0);
    if (Math.round(sumPct) !== 100) errors.splitDetails = 'Percentages must equal 100%';
  }

  if (method === 'shares') {
    const sumShares = Object.values(numericDetails).reduce((s, v) => s + v, 0);
    if (sumShares <= 0) errors.splitDetails = 'Total shares must be greater than 0';
  }

  return {valid: Object.values(errors).every((e) => !e), errors};
}
