import type {Transaction} from '@/types';
import type {GroupSplitType} from '../../types/addGroupTransaction';

export interface EditGroupTransactionFormState {
  description: string;
  amount: string;
  paidBy: string;
  selectedCategoryId: string;
  splitType: GroupSplitType;
  receiptUri: string | null;
  customAmounts: Record<string, string>;
  percentageAmounts: Record<string, string>;
  sharesAmounts: Record<string, string>;
}

export const emptyEditGroupTransactionFormState = (): EditGroupTransactionFormState => ({
  description: '',
  amount: '',
  paidBy: '',
  selectedCategoryId: '',
  splitType: 'equal',
  receiptUri: null,
  customAmounts: {},
  percentageAmounts: {},
  sharesAmounts: {},
});

export const createEditGroupTransactionFormState = ({
  transaction,
  defaultCategoryId,
}: {
  transaction: Transaction;
  defaultCategoryId: string;
}): EditGroupTransactionFormState => {
  const customAmounts: Record<string, string> = {};
  const percentageAmounts: Record<string, string> = {};
  const sharesAmounts: Record<string, string> = {};

  transaction.splitDetails?.forEach((detail) => {
    if (transaction.splitMethod === 'custom') {
      customAmounts[detail.memberId] = detail.amount.toString();
    } else if (transaction.splitMethod === 'percentage') {
      percentageAmounts[detail.memberId] = (detail.percentage || 0).toString();
    } else if (transaction.splitMethod === 'shares') {
      sharesAmounts[detail.memberId] = (detail.shares || 1).toString();
    }
  });

  return {
    description: transaction.description || '',
    amount: Math.abs(transaction.amount).toString(),
    paidBy: transaction.paidBy || '',
    selectedCategoryId: defaultCategoryId,
    splitType: transaction.splitMethod || 'equal',
    receiptUri: transaction.receiptUrl || null,
    customAmounts,
    percentageAmounts,
    sharesAmounts,
  };
};

export const createEditGroupTransactionSplitDetails = ({
  splitType,
  customAmounts,
  percentageAmounts,
  sharesAmounts,
}: Pick<
  EditGroupTransactionFormState,
  'splitType' | 'customAmounts' | 'percentageAmounts' | 'sharesAmounts'
>): Record<string, number> => {
  const source =
    splitType === 'custom'
      ? customAmounts
      : splitType === 'percentage'
        ? percentageAmounts
        : splitType === 'shares'
          ? sharesAmounts
          : {};

  return Object.fromEntries(
    Object.entries(source).map(([memberId, value]) => [memberId, Number.parseFloat(value) || 0]),
  );
};
