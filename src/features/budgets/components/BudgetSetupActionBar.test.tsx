import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import type {UseBudgetSetupScreenResult} from '../hooks/useBudgetSetupScreen';
import {BudgetSetupActionBar} from './BudgetSetupActionBar';

const createMockScreen = (
  overrides?: Partial<UseBudgetSetupScreenResult>,
): UseBudgetSetupScreenResult =>
  ({
    currentStep: 0,
    setCurrentStep: jest.fn(),
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
    canProceedToNextStep: true,
    isLastStep: false,
    canNavigateToStep: jest.fn(() => true),
    isSaving: false,
    existingBudget: null,
    saveBudget: jest.fn(() => Promise.resolve()),
    ...overrides,
  }) as unknown as UseBudgetSetupScreenResult;

describe('BudgetSetupActionBar', () => {
  it('renders back and next buttons on step 0', () => {
    const screen = createMockScreen({currentStep: 0});
    const {getByText} = render(<BudgetSetupActionBar screen={screen} />);

    const backBtn = getByText('Back');
    const nextBtn = getByText('Next: Allocations');
    expect(backBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();

    fireEvent.press(backBtn);
    expect(screen.goToPreviousStep).toHaveBeenCalledTimes(1);

    fireEvent.press(nextBtn);
    expect(screen.goToNextStep).toHaveBeenCalledTimes(1);
  });

  it('renders back and next buttons on step 1', () => {
    const screen = createMockScreen({currentStep: 1});
    const {getByText} = render(<BudgetSetupActionBar screen={screen} />);

    const backBtn = getByText('Back');
    const nextBtn = getByText('Next: Review');
    expect(backBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();

    fireEvent.press(backBtn);
    expect(screen.goToPreviousStep).toHaveBeenCalledTimes(1);

    fireEvent.press(nextBtn);
    expect(screen.goToNextStep).toHaveBeenCalledTimes(1);
  });

  it('renders back and save buttons on step 2', () => {
    const screen = createMockScreen({currentStep: 2});
    const {getByText} = render(<BudgetSetupActionBar screen={screen} />);

    const backBtn = getByText('Back');
    const saveBtn = getByText('Create Budget Plan');
    expect(backBtn).toBeTruthy();
    expect(saveBtn).toBeTruthy();

    fireEvent.press(saveBtn);
    expect(screen.saveBudget).toHaveBeenCalledTimes(1);
  });
});
