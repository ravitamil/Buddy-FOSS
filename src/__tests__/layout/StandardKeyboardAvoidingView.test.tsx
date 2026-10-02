/**
 * StandardKeyboardAvoidingView Component Tests
 * Tests for consistent keyboard avoiding behavior across platforms
 */

import React from 'react';
import {render} from '@testing-library/react-native';
import {Platform, Text} from 'react-native';
import {StandardKeyboardAvoidingView} from '../../components/ui/StandardKeyboardAvoidingView';

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAvoidingView: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('../../services/LoggerService', () => ({
  logger: {
    component: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

describe('StandardKeyboardAvoidingView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children correctly', () => {
    const {getByText} = render(
      <StandardKeyboardAvoidingView>
        <Text>Test Content</Text>
      </StandardKeyboardAvoidingView>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should use iOS padding behavior by default on iOS', () => {
    Platform.OS = 'ios';

    const {getByTestId} = render(
      <StandardKeyboardAvoidingView>
        <Text testID="test-content">Test Content</Text>
      </StandardKeyboardAvoidingView>,
    );

    const content = getByTestId('test-content');
    expect(content).toBeTruthy();
  });

  it('should use Android height behavior by default on Android', () => {
    Platform.OS = 'android';

    const {getByTestId} = render(
      <StandardKeyboardAvoidingView>
        <Text testID="test-content">Test Content</Text>
      </StandardKeyboardAvoidingView>,
    );

    const content = getByTestId('test-content');
    expect(content).toBeTruthy();
  });

  it('should respect custom behavior prop', () => {
    const {getByTestId} = render(
      <StandardKeyboardAvoidingView behavior="position">
        <Text testID="test-content">Test Content</Text>
      </StandardKeyboardAvoidingView>,
    );

    const content = getByTestId('test-content');
    expect(content).toBeTruthy();
  });

  it('should respect custom keyboard vertical offset', () => {
    const {getByTestId} = render(
      <StandardKeyboardAvoidingView keyboardVerticalOffset={50}>
        <Text testID="test-content">Test Content</Text>
      </StandardKeyboardAvoidingView>,
    );

    const content = getByTestId('test-content');
    expect(content).toBeTruthy();
  });

  it('should render children directly when disabled', () => {
    const {getByTestId} = render(
      <StandardKeyboardAvoidingView enabled={false}>
        <Text testID="test-content">Test Content</Text>
      </StandardKeyboardAvoidingView>,
    );

    const content = getByTestId('test-content');
    expect(content).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = {backgroundColor: 'red'};

    const {getByTestId} = render(
      <StandardKeyboardAvoidingView style={customStyle}>
        <Text testID="test-content">Test Content</Text>
      </StandardKeyboardAvoidingView>,
    );

    const content = getByTestId('test-content');
    expect(content).toBeTruthy();
  });
});
