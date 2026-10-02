import React from 'react';
import type {ReactNode} from 'react';
import {GlassSurface, type GlassSurfaceProps} from '@ravitamil/buddy-ui';

interface BudgetGlassCardProps {
  children: ReactNode;
  style?: GlassSurfaceProps['style'];
  padding?: number;
}

export const BudgetGlassCard = React.memo(function BudgetGlassCard({
  children,
  style,
  padding = 20,
}: BudgetGlassCardProps) {
  return (
    <GlassSurface padding={padding} style={[{marginBottom: 8}, style]}>
      {children}
    </GlassSurface>
  );
});
