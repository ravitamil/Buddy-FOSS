import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {TamaguiProvider, Theme} from 'tamagui';
import ErrorBoundary from './ErrorBoundary';
import config from '../../tamagui.config';

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({
    isDarkMode: false,
    toggleTheme: jest.fn(),
  }),
}));

// A component that throws an error
const BadComponent = () => {
  throw new Error('Test error');
};

// A component that renders correctly
const GoodComponent = () => React.createElement('Text', null, 'Good Component');

const TestWrapper = ({children}: {children: React.ReactNode}) => (
  <TamaguiProvider config={config}>
    <Theme name="light">{children}</Theme>
  </TamaguiProvider>
);

describe('ErrorBoundary', () => {
  it('should catch errors and display fallback UI', () => {
    const {getByText} = render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>,
      {
        wrapper: TestWrapper,
      },
    );

    // Should display the error message
    expect(getByText(/Something Went Wrong/i)).toBeTruthy();
  });

  it('should render children when there are no errors', () => {
    const {getByText} = render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>,
      {
        wrapper: TestWrapper,
      },
    );

    expect(getByText('Good Component')).toBeTruthy();
  });

  it('should allow retrying after an error', () => {
    const {getByRole, getByText} = render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>,
      {
        wrapper: TestWrapper,
      },
    );

    // Click the retry button
    const retryButton = getByRole('button', {name: /Try Again/i});
    fireEvent.press(retryButton);

    // After retry, it should still show the error since the component still throws
    expect(getByText(/Something Went Wrong/i)).toBeTruthy();
  });
});
