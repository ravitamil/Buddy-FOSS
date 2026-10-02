import type {GroupMember, Transaction} from '@/types';
import type {ValidationResult} from './groupValidationTypes';

export const validateTransaction = (
  transaction: Partial<Transaction>,
  groupMembers: GroupMember[],
  index?: number,
  options: {strictAmountValidation?: boolean} = {},
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const prefix = index !== undefined ? `Transaction ${index + 1}` : 'Transaction';
  const {strictAmountValidation = true} = options;

  try {
    validateRequiredTransactionFields(
      transaction,
      prefix,
      errors,
      warnings,
      strictAmountValidation,
    );
    validateTransactionMemberReferences(transaction, groupMembers, prefix, errors, warnings);
    validateTransactionSplitAmounts(
      transaction,
      groupMembers,
      prefix,
      errors,
      strictAmountValidation,
    );

    if (transaction.notes && transaction.notes.length > 500) {
      warnings.push(`${prefix}: Notes are quite long (over 500 characters)`);
    }
  } catch (error) {
    appLogger.error('ðŸ” validateTransaction: Validation error:', error);
    errors.push(
      `${prefix}: Validation failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

function validateRequiredTransactionFields(
  transaction: Partial<Transaction>,
  prefix: string,
  errors: string[],
  warnings: string[],
  strictAmountValidation: boolean,
) {
  if (!transaction.id || transaction.id.trim().length === 0) {
    errors.push(`${prefix}: ID is required`);
  }

  if (!transaction.description || transaction.description.trim().length === 0) {
    errors.push(`${prefix}: Description is required`);
  } else if (transaction.description.trim().length > 200) {
    warnings.push(`${prefix}: Description is quite long (over 200 characters)`);
  }

  validateTransactionAmount(transaction, prefix, errors, warnings, strictAmountValidation);

  if (!transaction.type) {
    errors.push(`${prefix}: Type is required`);
  } else if (!['expense', 'income'].includes(transaction.type)) {
    errors.push(`${prefix}: Type must be either 'expense' or 'income'`);
  }

  if (!transaction.date) {
    errors.push(`${prefix}: Date is required`);
  } else {
    const transactionDate = new Date(transaction.date);
    if (isNaN(transactionDate.getTime())) {
      errors.push(`${prefix}: Date must be a valid date`);
    } else if (transactionDate > new Date()) {
      warnings.push(`${prefix}: Date is in the future`);
    }
  }

  if (transaction.category && transaction.category.length > 50) {
    warnings.push(`${prefix}: Category name is quite long`);
  }
}

function validateTransactionAmount(
  transaction: Partial<Transaction>,
  prefix: string,
  errors: string[],
  warnings: string[],
  strictAmountValidation: boolean,
) {
  if (typeof transaction.amount !== 'number') {
    errors.push(`${prefix}: Amount is required and must be a number`);
    return;
  }

  if (!isFinite(transaction.amount)) {
    errors.push(`${prefix}: Amount must be a valid number`);
  } else if (transaction.amount === 0) {
    errors.push(`${prefix}: Amount cannot be zero`);
  } else if (strictAmountValidation) {
    if (transaction.type === 'expense' && transaction.amount > 0) {
      errors.push(`${prefix}: Expense amounts should be negative`);
    } else if (transaction.type === 'income' && transaction.amount < 0) {
      errors.push(`${prefix}: Income amounts should be positive`);
    }
  }

  if (Math.abs(transaction.amount) > 1000000) {
    warnings.push(`${prefix}: Amount is very large (${transaction.amount})`);
  } else if (Math.abs(transaction.amount) < 0.01) {
    warnings.push(`${prefix}: Amount is very small (${transaction.amount})`);
  }
}

function validateTransactionMemberReferences(
  transaction: Partial<Transaction>,
  groupMembers: GroupMember[],
  prefix: string,
  errors: string[],
  warnings: string[],
) {
  const memberIds = groupMembers.map((member) => member.id);

  if (transaction.paidBy) {
    if (!memberIds.includes(transaction.paidBy)) {
      errors.push(`${prefix}: Paid by member is not in the group`);
    }
  } else if (transaction.type === 'expense') {
    errors.push(`${prefix}: Expense must specify who paid for it`);
  }

  if (!transaction.splitAmong || !Array.isArray(transaction.splitAmong)) return;

  const invalidMembers = transaction.splitAmong.filter((id) => !memberIds.includes(id));
  if (invalidMembers.length > 0) {
    errors.push(`${prefix}: Split includes members not in group: ${invalidMembers.join(', ')}`);
  }

  if (transaction.splitAmong.length === 0) {
    warnings.push(`${prefix}: Split among list is empty`);
  }

  const splitSet = new Set(transaction.splitAmong);
  if (splitSet.size !== transaction.splitAmong.length) {
    errors.push(`${prefix}: Duplicate members in split list`);
  }
}

function validateTransactionSplitAmounts(
  transaction: Partial<Transaction>,
  groupMembers: GroupMember[],
  prefix: string,
  errors: string[],
  strictAmountValidation: boolean,
) {
  if (!transaction.splitAmounts || typeof transaction.splitAmounts !== 'object') return;

  const memberIds = groupMembers.map((member) => member.id);
  const splitMemberIds = Object.keys(transaction.splitAmounts);
  const invalidSplitMembers = splitMemberIds.filter((id) => !memberIds.includes(id));

  if (invalidSplitMembers.length > 0) {
    errors.push(
      `${prefix}: Split amounts include members not in group: ${invalidSplitMembers.join(', ')}`,
    );
  }

  const splitAmounts = Object.values(transaction.splitAmounts);
  const totalSplitAmount = splitAmounts.reduce((sum, amount) => sum + amount, 0);

  if (
    strictAmountValidation &&
    transaction.amount !== undefined &&
    Math.abs(totalSplitAmount - Math.abs(transaction.amount)) > 0.01
  ) {
    errors.push(
      `${prefix}: Split amounts (${totalSplitAmount.toFixed(2)}) don't match transaction amount (${Math.abs(transaction.amount).toFixed(2)})`,
    );
  }

  splitAmounts.forEach((amount, index) => {
    if (typeof amount !== 'number' || !isFinite(amount)) {
      errors.push(`${prefix}: Split amount ${index + 1} is not a valid number`);
    } else if (amount < 0) {
      errors.push(`${prefix}: Split amount ${index + 1} cannot be negative`);
    }
  });
}
