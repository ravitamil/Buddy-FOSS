import type {Category, Transaction} from '@/types';
import type {AddTransactionRouteType, RecurrenceFrequencyOption} from '../types';

export const recurrenceFrequencies: RecurrenceFrequencyOption[] = [
  {value: 'daily', label: 'Daily'},
  {value: 'biweekly', label: 'Bi-Weekly'},
  {value: 'monthly', label: 'Monthly'},
  {value: 'quarterly', label: 'Quarterly'},
  {value: 'semiannually', label: 'Semi-Annually'},
  {value: 'annually', label: 'Annually'},
];

export const getRouteTransactionType = (type?: string): AddTransactionRouteType =>
  type === 'income' ? 'income' : 'expense';

export const getCategoryName = (category: Transaction['category']): string =>
  typeof category === 'string' ? category : 'General';

export const filterTransactionCategories = (
  categories: Category[],
  transactionType: AddTransactionRouteType,
): Category[] => categories.filter((category) => category.type === transactionType);

export const sanitizeAmountInput = (text: string): string => {
  if (!text) {
    return '';
  }

  const [integerPart, ...decimalParts] = text.replace(/[^0-9.]/g, '').split('.');
  if (decimalParts.length === 0) {
    return integerPart;
  }

  const decimalPart = decimalParts.join('').substring(0, 2);
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
};

export const buildAddTransactionReadModel = ({
  amount,
  isEditMode,
  isIncome,
  isSaving,
}: {
  amount: string;
  isEditMode: boolean;
  isIncome: boolean;
  isSaving: boolean;
}) => {
  const transactionLabel = isIncome ? 'Income' : 'Expense';
  const parsedAmount = Number.parseFloat(amount);

  return {
    title: `${isEditMode ? 'Edit' : 'Add'} ${transactionLabel}`,
    subtitle: isEditMode
      ? `Update your ${transactionLabel.toLowerCase()} transaction`
      : `Record a new ${transactionLabel.toLowerCase()} transaction`,
    canSave: Boolean(amount) && !Number.isNaN(parsedAmount) && parsedAmount > 0 && !isSaving,
  };
};

export const buildTransactionInput = ({
  parsedAmount,
  description,
  selectedCategoryName,
  selectedCategoryId,
  selectedWalletId,
  fallbackCategoryName,
  transactionType,
  selectedDate,
}: {
  parsedAmount: number;
  description: string;
  selectedCategoryName?: string;
  selectedCategoryId?: string;
  selectedWalletId?: string;
  fallbackCategoryName?: string;
  transactionType: AddTransactionRouteType;
  selectedDate: Date;
}): Omit<Transaction, 'id' | 'isRecurring'> => ({
  amount: transactionType === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
  description:
    description.trim() || `${transactionType === 'income' ? 'Income' : 'Expense'} transaction`,
  category: selectedCategoryName ?? fallbackCategoryName ?? 'General',
  categoryId: selectedCategoryId,
  ...(selectedWalletId ? {walletId: selectedWalletId} : {}),
  type: transactionType,
  date: selectedDate.toISOString(),
});
