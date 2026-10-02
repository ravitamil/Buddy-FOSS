import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import {MetricCard} from '@ravitamil/buddy-ui';

describe('MetricCard', () => {
  it('renders a semantic trend', () => {
    const {getByText} = render(
      <MetricCard
        title="Savings"
        value="$2,500"
        icon="trending-up"
        tone="positive"
        trend="+12%"
        density="regular"
      />,
    );

    expect(getByText('Savings')).toBeTruthy();
    expect(getByText('+12%')).toBeTruthy();
  });

  it('exposes pressable metrics as buttons', () => {
    const onPress = jest.fn();
    const {getByLabelText} = render(
      <MetricCard title="Net worth" value="$8,000" icon="wallet" onPress={onPress} />,
    );

    fireEvent.press(getByLabelText('Net worth'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
