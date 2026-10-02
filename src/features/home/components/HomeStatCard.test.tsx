import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {StyleSheet} from 'react-native';

import {HomeStatCard} from './HomeStatCard';

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: jest.fn(() => ({isDarkMode: true})),
}));

describe('HomeStatCard', () => {
  it('keeps a readable home-specific summary and full-tile action', () => {
    const onPress = jest.fn();
    const {getByLabelText, getByTestId, getByText} = render(
      <HomeStatCard
        title="Income"
        value="₹8,000"
        icon="trending-up"
        percentage="+12%"
        percentageColor="#22c55e"
        type="income"
        onPress={onPress}
      />,
    );

    expect(getByText('Income')).toBeTruthy();
    expect(getByText('₹8,000')).toBeTruthy();
    expect(getByText('+12%')).toBeTruthy();
    expect(getByTestId('home-stat-card-gradient')).toBeTruthy();
    expect(
      StyleSheet.flatten(getByTestId('home-stat-card-gradient-wash').props.style),
    ).toMatchObject({
      top: -11,
      right: -11,
      bottom: -11,
      left: -11,
      borderRadius: 15,
    });

    fireEvent.press(getByLabelText('Income, ₹8,000, +12% this month'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
