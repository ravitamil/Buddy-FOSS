import React from 'react';
import {Text as MockText} from 'react-native';
import {render} from '@testing-library/react-native';

import AnalyticsScreen from './AnalyticsScreen';
import {useAnalyticsScreen} from '@/features/analytics/hooks/useAnalyticsScreen';

jest.mock('@/features/analytics/hooks/useAnalyticsScreen', () => ({
  useAnalyticsScreen: jest.fn(() => ({screenId: 'analytics'})),
}));

jest.mock('@/features/analytics/components/AnalyticsScreenSections', () => ({
  AnalyticsScreenSections: ({screen}: {screen: {screenId: string}}) => {
    return <MockText testID="analytics-screen">{screen.screenId}</MockText>;
  },
}));

describe('route shell screen modules', () => {
  it('renders AnalyticsScreen through its feature-owned screen model and sections', () => {
    const {getByTestId, getByText} = render(<AnalyticsScreen />);

    expect(useAnalyticsScreen).toHaveBeenCalledTimes(1);
    expect(getByTestId('analytics-screen')).toBeTruthy();
    expect(getByText('analytics')).toBeTruthy();
  });
});
