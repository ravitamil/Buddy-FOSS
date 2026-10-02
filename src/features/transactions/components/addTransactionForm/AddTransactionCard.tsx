import React from 'react';

import {GlassSurface} from '@ravitamil/buddy-ui';

interface AddTransactionCardProps {
  children: React.ReactNode;
}

export function AddTransactionCard({children}: AddTransactionCardProps) {
  return (
    <GlassSurface testID="add-transaction-glass-card" padding={16} borderRadius={20}>
      {children}
    </GlassSurface>
  );
}
