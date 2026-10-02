import {render} from '@testing-library/react-native';
import React from 'react';

import {BudgetSetupStepIndicator} from './BudgetSetupStepIndicator';

describe('BudgetSetupStepIndicator', () => {
  it('renders step counter, title, and progress bar', () => {
    const {getByText, getByTestId} = render(<BudgetSetupStepIndicator currentStep={0} />);

    expect(getByText('Step 1 of 3')).toBeTruthy();
    expect(getByText('Plan & Income Foundation')).toBeTruthy();
    expect(getByTestId('budget-setup-progress-bar')).toBeTruthy();
  });

  it('renders correct step title for step 1', () => {
    const {getByText} = render(<BudgetSetupStepIndicator currentStep={1} />);

    expect(getByText('Step 2 of 3')).toBeTruthy();
    expect(getByText('Spending & Savings Allocations')).toBeTruthy();
  });
});
