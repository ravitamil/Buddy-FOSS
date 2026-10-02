import React from 'react';
import {GlassSurface, type GlassSurfaceProps} from '@ravitamil/buddy-ui';

interface LoanGlassCardProps {
  children: React.ReactNode;
  style?: GlassSurfaceProps['style'];
  contentStyle?: GlassSurfaceProps['contentStyle'];
}

export function LoanGlassCard({children, style, contentStyle}: LoanGlassCardProps) {
  return (
    <GlassSurface style={style} contentStyle={contentStyle}>
      {children}
    </GlassSurface>
  );
}
