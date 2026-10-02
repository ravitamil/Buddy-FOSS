import {useState} from 'react';

export type TransactionType = 'expense' | 'payment';

export function useTransactionForm(
  initial?: Partial<{
    description: string;
    amount: string;
    type: TransactionType;
  }>,
) {
  const [description, setDescription] = useState(initial?.description || '');
  const [amount, setAmount] = useState(initial?.amount || '');
  const [type, setType] = useState<TransactionType>(initial?.type || 'expense');

  return {
    description,
    setDescription,
    amount,
    setAmount,
    type,
    setType,
  };
}
