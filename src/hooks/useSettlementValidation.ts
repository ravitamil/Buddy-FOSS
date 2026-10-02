import {validateExpense, validatePayment, validateSplits} from '../utils/validation/schemas';

export function validateSettlementData(params: {
  description: string;
  amount: string | number;
  paidBy: string;
  receivedBy: string[];
  splitMethod?: 'equal' | 'custom' | 'percentage' | 'shares';
  splitDetails?: Record<string, number>;
  membersCount?: number;
}) {
  if (params.splitMethod) {
    const exp = validateExpense({
      description: params.description,
      amount: params.amount,
      splitMethod: params.splitMethod,
      splitDetails: params.splitDetails,
      membersCount: params.membersCount,
    });
    if (!exp.valid) return {valid: false, errors: exp.errors};
    if (params.splitMethod !== 'equal') {
      const total = typeof params.amount === 'string' ? parseFloat(params.amount) : params.amount;
      const splitCheck = validateSplits(
        params.splitMethod,
        total,
        params.splitDetails || {},
        params.membersCount || 0,
      );
      if (!splitCheck.valid) return {valid: false, errors: splitCheck.errors};
    }
  } else {
    const pay = validatePayment({
      description: params.description,
      amount: params.amount,
      paidBy: params.paidBy,
      receivedBy: params.receivedBy,
    });
    if (!pay.valid) return {valid: false, errors: pay.errors};
  }

  return {valid: true, errors: {} as Record<string, string | undefined>};
}
