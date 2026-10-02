/**
 * ScreenContainer Component Tests
 * Tests for enhanced ScreenContainer with consistent prop patterns
 */

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */

import React from 'react';
import {render} from '@testing-library/react-native';
import {Text} from 'react-native';
import {ScreenContainer} from '../../components/ui/ScreenContainer';

// Mock dependencies
jest.mock('../../context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({
    isDarkMode: false,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({children, ...props}: any) => <div {...props}>{children}</div>,
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MockSvgNode = ({children, ...props}: any) => <View {...props}>{children}</View>;

  return {
    __esModule: true,
    default: MockSvgNode,
    Defs: MockSvgNode,
    Pattern: MockSvgNode,
    Circle: MockSvgNode,
    Rect: MockSvgNode,
  };
});

describe('ScreenContainer', () => {
  it('should render children correctly', () => {
    const {getByText} = render(
      <ScreenContainer>
        <Text>Test Content</Text>
      </ScreenContainer>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should handle showDots prop correctly', () => {
    const {getByText} = render(
      <ScreenContainer showDots={false}>
        <Text>No Dots Content</Text>
      </ScreenContainer>,
    );

    expect(getByText('No Dots Content')).toBeTruthy();
  });

  it('should handle theme prop correctly', () => {
    const {getByText} = render(
      <ScreenContainer theme="dark">
        <Text>Dark Theme Content</Text>
      </ScreenContainer>,
    );

    expect(getByText('Dark Theme Content')).toBeTruthy();
  });

  it('should handle gradient correctly', () => {
    const {getByText} = render(
      <ScreenContainer showGradient={true}>
        <Text>Gradient Content</Text>
      </ScreenContainer>,
    );

    expect(getByText('Gradient Content')).toBeTruthy();
  });
});
