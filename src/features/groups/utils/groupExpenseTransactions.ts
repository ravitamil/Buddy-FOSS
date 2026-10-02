import {SplitDetail, Transaction} from '../../../types';

export interface GroupExpenseInput {
  amount: number;
  description: string;
  paidBy: string;
  category: string;
  categoryId?: string;
  splitMethod?: 'equal' | 'custom' | 'percentage' | 'shares';
  splitDetails?: SplitDetail[];
  receiptUrl?: string;
  receiptUrls?: string[];
  notes?: string;
  transactionCurrency?: string;
  fxRateApplied?: number;
}

export const getReceiptUrls = (expense: GroupExpenseInput): string[] =>
  expense.receiptUrls || (expense.receiptUrl ? [expense.receiptUrl] : []);

export const buildGroupExpenseTransaction = ({
  id,
  groupId,
  expense,
  splitMethod,
  splitDetails,
  now = new Date(),
}: {
  id: string;
  groupId: string;
  expense: GroupExpenseInput;
  splitMethod: NonNullable<GroupExpenseInput['splitMethod']>;
  splitDetails: SplitDetail[];
  now?: Date;
}): Transaction => ({
  id,
  amount: -Math.abs(expense.amount),
  category: expense.category,
  categoryId: expense.categoryId,
  description: expense.description,
  date: now.toISOString(),
  type: 'expense',
  groupId,
  paidBy: expense.paidBy,
  splitAmong: splitDetails.map((detail) => detail.memberId),
  splitMethod,
  splitDetails,
  receiptUrl: expense.receiptUrl,
  receiptUrls: getReceiptUrls(expense),
  notes: expense.notes,
  createdBy: expense.paidBy,
  lastModified: now,
  transactionCurrency: expense.transactionCurrency,
  fxRateApplied: expense.fxRateApplied,
});

export const updateGroupExpenseTransaction = ({
  transaction,
  expense,
  splitMethod,
  splitDetails,
  now = new Date(),
}: {
  transaction: Transaction;
  expense: GroupExpenseInput;
  splitMethod: NonNullable<GroupExpenseInput['splitMethod']>;
  splitDetails: SplitDetail[];
  now?: Date;
}): Transaction => ({
  ...transaction,
  amount: -Math.abs(expense.amount),
  category: expense.category,
  categoryId: expense.categoryId,
  description: expense.description,
  paidBy: expense.paidBy,
  splitAmong: splitDetails.map((detail) => detail.memberId),
  splitMethod,
  splitDetails,
  receiptUrl: expense.receiptUrl,
  receiptUrls: getReceiptUrls(expense),
  notes: expense.notes,
  lastModified: now,
  transactionCurrency: expense.transactionCurrency ?? transaction.transactionCurrency,
  fxRateApplied: expense.fxRateApplied ?? transaction.fxRateApplied,
});
