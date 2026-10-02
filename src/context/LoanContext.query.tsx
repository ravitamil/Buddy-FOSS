import React, {createContext, useContext} from 'react';

import type {LoanContextType} from '@/features/loans/context/loanContextTypes';
import {useLoanProviderValue} from '@/features/loans/context/useLoanProviderValue';

const LoanContext = createContext<LoanContextType | undefined>(undefined);

interface LoanProviderProps {
  children: React.ReactNode;
}

export const LoanQueryProvider: React.FC<LoanProviderProps> = ({children}) => {
  const contextValue = useLoanProviderValue();

  return <LoanContext.Provider value={contextValue}>{children}</LoanContext.Provider>;
};

export const useLoanQuery = (): LoanContextType => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoanQuery must be used within a LoanQueryProvider');
  }
  return context;
};

export type {EnhancedLoan, LoanContextType} from '@/features/loans/context/loanContextTypes';
