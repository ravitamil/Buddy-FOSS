import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

jest.mock('@/components/ui', () => ({ScreenWrapper: 'ScreenWrapper'}));
jest.mock('@/context', () => ({useSettings: jest.fn()}));
jest.mock('@/hooks/useAlert', () => ({useAlert: jest.fn()}));
jest.mock('expo-router', () => ({router: {push: jest.fn()}}));
jest.mock('../hooks/useBudgetCycleModel', () => ({useBudgetCycleModel: jest.fn()}));
jest.mock('../hooks/useBudgetState', () => ({useBudgetState: jest.fn()}));

import {BudgetTrackerEmptyState} from './BudgetTrackerView';

describe('BudgetTrackerEmptyState', () => {
  it('uses the shared empty-state anatomy and exposes the icon action', () => {
    const onSetup = jest.fn();
    const {getByLabelText, getByText} = render(
      <BudgetTrackerEmptyState iconColor="#10b981" onSetup={onSetup} />,
    );

    expect(getByText('No Budget Plans Yet')).toBeTruthy();
    fireEvent.press(getByLabelText('Set up budget'));
    expect(onSetup).toHaveBeenCalledTimes(1);
  });
});
