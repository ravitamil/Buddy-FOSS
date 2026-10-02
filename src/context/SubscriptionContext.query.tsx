import React, {createContext, useContext} from 'react';

import type {SubscriptionContextType} from '@/features/subscriptions/context/subscriptionContextTypes';
import {useSubscriptionProviderValue} from '@/features/subscriptions/context/useSubscriptionProviderValue';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionQueryProvider: React.FC<SubscriptionProviderProps> = ({children}) => {
  const contextValue = useSubscriptionProviderValue();

  return (
    <SubscriptionContext.Provider value={contextValue}>{children}</SubscriptionContext.Provider>
  );
};

export const useSubscriptionQuery = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionQuery must be used within a SubscriptionQueryProvider');
  }
  return context;
};

export type {
  Subscription,
  SubscriptionContextType,
} from '@/features/subscriptions/context/subscriptionContextTypes';
