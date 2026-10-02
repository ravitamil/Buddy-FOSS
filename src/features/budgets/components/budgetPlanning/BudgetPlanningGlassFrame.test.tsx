import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {Text} from '@ravitamil/buddy-ui';

import {BudgetPlanningGlassFrame} from './BudgetPlanningGlassFrame';

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: jest.fn(() => ({isDarkMode: true})),
}));

describe('BudgetPlanningGlassFrame', () => {
  it('keeps the complete budget surface tappable', () => {
    const onPress = jest.fn();
    const {getByLabelText, getByTestId, getByText} = render(
      <BudgetPlanningGlassFrame
        accessibilityLabel="View budget details"
        onPress={onPress}
        height={200}>
        <Text>August Budget</Text>
      </BudgetPlanningGlassFrame>,
    );

    expect(getByText('August Budget')).toBeTruthy();
    expect(getByTestId('budget-planning-card-gradient')).toBeTruthy();
    fireEvent.press(getByLabelText('View budget details'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports passive card chrome for zero states with their own action', () => {
    const {getByTestId, queryByLabelText} = render(
      <BudgetPlanningGlassFrame height={200}>
        <Text>Set up your budget</Text>
      </BudgetPlanningGlassFrame>,
    );

    expect(getByTestId('budget-planning-card-gradient')).toBeTruthy();
    expect(queryByLabelText('Set up your budget')).toBeNull();
  });
});
