import React from 'react';

import {GlassSurface} from '@ravitamil/buddy-ui';

interface FindGroupGlassCardProps {
  children: React.ReactNode;
  padding?: number;
}

export const FindGroupGlassCard = ({children, padding = 16}: FindGroupGlassCardProps) => (
  <GlassSurface padding={padding} style={{marginBottom: 12}} fill>
    {children}
  </GlassSurface>
);
