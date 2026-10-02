import React, {createContext, useContext} from 'react';

import type {TransactionContextType} from '@/features/transactions/context/transactionContextTypes';
import {useTransactionProviderValue} from '@/features/transactions/context/useTransactionProviderValue';

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: React.ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({children}) => {
  const contextValue = useTransactionProviderValue();

  return <TransactionContext.Provider value={contextValue}>{children}</TransactionContext.Provider>;
};

export const useTransaction = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export type {TransactionContextType} from '@/features/transactions/context/transactionContextTypes';

export default TransactionContext;
