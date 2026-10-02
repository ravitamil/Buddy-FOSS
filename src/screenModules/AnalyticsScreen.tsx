import React from 'react';

import {AnalyticsScreenSections} from '@/features/analytics/components/AnalyticsScreenSections';
import {useAnalyticsScreen} from '@/features/analytics/hooks/useAnalyticsScreen';

export default function AnalyticsScreen() {
  const screen = useAnalyticsScreen();
  return <AnalyticsScreenSections screen={screen} />;
}
