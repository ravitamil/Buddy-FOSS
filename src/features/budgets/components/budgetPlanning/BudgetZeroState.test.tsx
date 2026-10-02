import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

jest.mock('lottie-react-native', () => 'LottieView');
jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: jest.fn(() => ({isDarkMode: false})),
}));

import {BudgetZeroState} from './BudgetZeroState';

describe('BudgetZeroState', () => {
  it('exposes only Get Started as the budget setup action', () => {
    const onSetupBudget = jest.fn();
    const {getAllByLabelText} = render(<BudgetZeroState onSetupBudget={onSetupBudget} />);

    const setupActions = getAllByLabelText('Set up your budget');

    expect(setupActions).toHaveLength(1);
    fireEvent.press(setupActions[0]);
    expect(onSetupBudget).toHaveBeenCalledTimes(1);
  });

  it('presents the animated setup invitation without redundant step copy', () => {
    const {getByTestId, getByText, queryByText} = render(
      <BudgetZeroState onSetupBudget={jest.fn()} />,
    );

    expect(getByTestId('budget-zero-state-animation')).toBeTruthy();
    expect(getByText('Give your money a purpose')).toBeTruthy();
    expect(getByText('Get started')).toBeTruthy();
    expect(queryByText('Three guided steps')).toBeNull();
  });
});
