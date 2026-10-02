import React, {type ReactNode} from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import {QuickActionsCard} from './QuickActionsCard';
import {useFeatureStatus} from '@/features/featureControls';

jest.mock('@/features/featureControls', () => ({
  useFeatureStatus: jest.fn(),
}));

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: jest.fn(() => ({isDarkMode: false})),
}));

jest.mock('expo-blur', () => ({
  BlurView: ({children}: {children?: ReactNode}) => children,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({children}: {children?: ReactNode}) => children,
}));

const mockUseFeatureStatus = jest.mocked(useFeatureStatus);

describe('QuickActionsCard', () => {
  const renderCard = () =>
    render(
      <QuickActionsCard
        onAnalysePress={jest.fn()}
        onAddTransactionPress={jest.fn()}
        onNetWorthPress={jest.fn()}
      />,
    );

  it('shows the Net Worth entry point when wallets are readable', () => {
    mockUseFeatureStatus.mockReturnValue({
      feature: 'wallets',
      status: 'enabled',
      isVisible: true,
      canRead: true,
      canWrite: true,
      canExecute: true,
    });

    const {getByText} = renderCard();

    expect(getByText('Net Worth')).toBeTruthy();
  });

  it('hides the Net Worth entry point when wallets are disabled', () => {
    mockUseFeatureStatus.mockReturnValue({
      feature: 'wallets',
      status: 'disabled',
      isVisible: false,
      canRead: false,
      canWrite: false,
      canExecute: false,
    });

    const onNetWorthPress = jest.fn();
    const {queryByText} = render(
      <QuickActionsCard
        onAnalysePress={jest.fn()}
        onAddTransactionPress={jest.fn()}
        onNetWorthPress={onNetWorthPress}
      />,
    );

    expect(queryByText('Net Worth')).toBeNull();
    expect(onNetWorthPress).not.toHaveBeenCalled();
  });

  it('keeps non-wallet actions available when wallets are disabled', () => {
    mockUseFeatureStatus.mockReturnValue({
      feature: 'wallets',
      status: 'disabled',
      isVisible: false,
      canRead: false,
      canWrite: false,
      canExecute: false,
    });

    const onAnalysePress = jest.fn();
    const onAddTransactionPress = jest.fn();
    const {getByText} = render(
      <QuickActionsCard
        onAnalysePress={onAnalysePress}
        onAddTransactionPress={onAddTransactionPress}
        onNetWorthPress={jest.fn()}
      />,
    );

    fireEvent.press(getByText('Analyse'));
    expect(onAnalysePress).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Add'));
    expect(onAddTransactionPress).toHaveBeenCalledTimes(1);
  });
});
