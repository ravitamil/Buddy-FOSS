import React, {createContext, useContext} from 'react';

import type {InvestmentContextType} from '@/features/investments/context/investmentContextTypes';
import {useInvestmentProviderValue} from '@/features/investments/context/useInvestmentProviderValue';

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

interface InvestmentProviderProps {
  children: React.ReactNode;
}

export const InvestmentProvider: React.FC<InvestmentProviderProps> = ({children}) => {
  const contextValue = useInvestmentProviderValue();

  return <InvestmentContext.Provider value={contextValue}>{children}</InvestmentContext.Provider>;
};

export const useInvestment = (): InvestmentContextType => {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error('useInvestment must be used within a InvestmentProvider');
  }
  return context;
};

export type {InvestmentContextType} from '@/features/investments/context/investmentContextTypes';

export default InvestmentContext;
