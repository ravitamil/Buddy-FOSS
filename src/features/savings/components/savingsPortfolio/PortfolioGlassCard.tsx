import React from 'react';

import {GlassSurface} from '@ravitamil/buddy-ui';

export const PortfolioGlassCard = ({
  children,
  marginTop,
  marginBottom,
}: {
  children: React.ReactNode;
  marginTop?: number;
  marginBottom?: number;
}) => {
  return (
    <GlassSurface style={{marginTop, marginBottom: marginBottom ?? 0}}>{children}</GlassSurface>
  );
};
