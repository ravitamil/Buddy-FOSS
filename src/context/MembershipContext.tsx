import React, {createContext, useContext, useMemo} from 'react';

export interface MembershipContextType {
  isPro: boolean;
  customerInfo: Record<string, unknown> | null;
  isLoading: boolean;
  restorePurchases: () => Promise<Record<string, unknown> | null>;
  purchasePackage: (pack: unknown) => Promise<void>;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export const useMembership = () => {
  const context = useContext(MembershipContext);
  if (!context) throw new Error('useMembership must be used within a MembershipProvider');
  return context;
};

export const MembershipProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const value = useMemo<MembershipContextType>(
    () => ({
      isPro: true,
      customerInfo: null,
      isLoading: false,
      restorePurchases: () => Promise.resolve(null),
      purchasePackage: () => Promise.resolve(),
    }),
    [],
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
};
