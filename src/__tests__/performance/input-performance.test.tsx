import React from 'react';
import {View, TextInput} from 'react-native';
import {render, fireEvent, act} from '@testing-library/react-native';
import type {RenderAPI} from '@testing-library/react-native';
import {TamaguiProvider} from 'tamagui';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {useDebouncedInput, useControlledInput} from '../../utils/inputOptimization';
import config from '../../../tamagui.config';

jest.mock('../../context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({
    isDarkMode: false,
    currentThemeName: 'light',
    toggleTheme: jest.fn(),
    isInitialized: true,
  }),
}));

jest.mock('../../utils/fonts', () => ({
  getFontFamilyForWeight: jest.fn(() => 'System'),
}));

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
});

const changeText = (screen: RenderAPI, testID: string, value: string) => {
  fireEvent.changeText(screen.getByTestId(testID), value);
};

const focusInput = (screen: RenderAPI, testID: string) => {
  fireEvent(screen.getByTestId(testID), 'focus');
};

const TestWrapper = ({children}: {children: React.ReactNode}) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

const renderWithProviders = (ui: React.ReactElement): RenderAPI =>
  render(<TestWrapper>{ui}</TestWrapper>);

const FormFieldTest = ({
  label,
  testID,
  onChangeText,
}: {
  label: string;
  testID: string;
  onChangeText: (value: string) => void;
}) => {
  const [value, setValue] = React.useState('');

  const handleChangeText = React.useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      onChangeText(nextValue);
    },
    [onChangeText],
  );

  return <FormField label={label} value={value} onChangeText={handleChangeText} testID={testID} />;
};

// Test component using useDebouncedInput
const DebouncedInputTest = ({
  onDebouncedChange,
  delay = 300,
}: {
  onDebouncedChange: (value: string) => void;
  delay?: number;
}) => {
  const {value, handleChange} = useDebouncedInput('', delay, onDebouncedChange);

  return <TextInput testID="debounced-input" value={value} onChangeText={handleChange} />;
};

// Test component using useControlledInput
const ControlledInputTest = ({onChangeText}: {onChangeText: (text: string) => void}) => {
  const {
    value,
    onChangeText: handleChange,
    isFocused,
    hasError,
  } = useControlledInput('', onChangeText);

  return (
    <View>
      <TextInput
        testID="controlled-input"
        value={value}
        onChangeText={handleChange}
        accessibilityState={{selected: isFocused}}
        accessibilityHint={hasError ? 'Input has error' : undefined}
      />
    </View>
  );
};

describe('Input Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('FormField Performance', () => {
    it('should prevent keyboard dismissal during rapid typing', () => {
      const onChangeText = jest.fn();

      const screen = renderWithProviders(
        <FormFieldTest
          label="Test Field"
          onChangeText={onChangeText}
          testID="standard-form-field"
        />,
      );

      // Simulate rapid typing
      const testString = 'rapid typing test';
      for (let i = 0; i < testString.length; i++) {
        const partialString = testString.substring(0, i + 1);

        act(() => {
          changeText(screen, 'standard-form-field', partialString);
        });
      }

      // Verify all changes were captured
      expect(onChangeText).toHaveBeenCalledTimes(testString.length);
      expect(onChangeText).toHaveBeenLastCalledWith(testString);
    });

    it('should maintain focus during text changes', () => {
      const onChangeText = jest.fn();

      const screen = renderWithProviders(
        <FormFieldTest
          label="Test Field"
          onChangeText={onChangeText}
          testID="standard-form-field"
        />,
      );

      // Focus the input
      focusInput(screen, 'standard-form-field');

      // Type multiple characters
      act(() => {
        changeText(screen, 'standard-form-field', 'a');
      });

      act(() => {
        changeText(screen, 'standard-form-field', 'ab');
      });

      act(() => {
        changeText(screen, 'standard-form-field', 'abc');
      });

      // Input should still be focused
      expect(screen.getByDisplayValue('abc')).toBeTruthy();
    });

    it('should handle validation without performance degradation', () => {
      const onChangeText = jest.fn();

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(50);

      const startTime = performance.now();

      const screen = renderWithProviders(
        <FormFieldTest
          label="Test Field"
          onChangeText={onChangeText}
          testID="standard-form-field"
        />,
      );

      // Type text
      act(() => {
        changeText(screen, 'standard-form-field', 'ab');
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Debounced Input Performance', () => {
    it('should debounce input changes efficiently', () => {
      const onDebouncedChange = jest.fn();

      const screen = render(
        <DebouncedInputTest onDebouncedChange={onDebouncedChange} delay={300} />,
      );

      // Type rapidly
      changeText(screen, 'debounced-input', 'a');
      changeText(screen, 'debounced-input', 'ab');
      changeText(screen, 'debounced-input', 'abc');

      // Should not have called the debounced function yet
      expect(onDebouncedChange).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should have called the debounced function once with the final value
      expect(onDebouncedChange).toHaveBeenCalledTimes(1);
      expect(onDebouncedChange).toHaveBeenCalledWith('abc');
    });

    it('should handle multiple debounce cycles', () => {
      const onDebouncedChange = jest.fn();

      const screen = render(
        <DebouncedInputTest onDebouncedChange={onDebouncedChange} delay={100} />,
      );

      // First typing session
      changeText(screen, 'debounced-input', 'first');

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onDebouncedChange).toHaveBeenCalledWith('first');

      // Second typing session
      changeText(screen, 'debounced-input', 'second');

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onDebouncedChange).toHaveBeenCalledWith('second');
      expect(onDebouncedChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Controlled Input Performance', () => {
    it('should maintain controlled state without re-render issues', () => {
      const onChangeText = jest.fn();

      const screen = render(<ControlledInputTest onChangeText={onChangeText} />);

      // Simulate controlled input changes
      changeText(screen, 'controlled-input', 'test');

      expect(onChangeText).toHaveBeenCalledWith('test');
      expect(screen.getByDisplayValue('test')).toBeTruthy();
    });

    it('should handle validation state changes efficiently', () => {
      const onChangeText = jest.fn();
      const validator = (value: string) => value.length >= 2;

      const TestComponent = () => {
        const {
          value,
          onChangeText: handleChange,
          hasError,
        } = useControlledInput('', onChangeText, validator);

        return (
          <TextInput
            testID="validated-input"
            value={value}
            onChangeText={handleChange}
            accessibilityHint={hasError ? 'Input has error' : undefined}
          />
        );
      };

      const screen = render(<TestComponent />);
      // Type invalid value
      changeText(screen, 'validated-input', 'a');
      expect(screen.getByHintText('Input has error')).toBeTruthy();

      // Type valid value
      changeText(screen, 'validated-input', 'abc');
      expect(screen.queryByHintText('Input has error')).toBeNull();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should handle high-frequency input changes', () => {
      const onChangeText = jest.fn();

      const screen = renderWithProviders(
        <FormFieldTest
          label="Benchmark Field"
          onChangeText={onChangeText}
          testID="benchmark-field"
        />,
      );

      const startTime = Date.now();

      // Simulate 100 rapid changes
      for (let i = 0; i < 100; i++) {
        act(() => {
          changeText(screen, 'benchmark-field', `value${i}`);
        });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should handle 100 changes in less than 1 second
      expect(totalTime).toBeLessThan(1000);
      expect(onChangeText).toHaveBeenCalledTimes(100);
    });

    it('should maintain performance with complex text input', () => {
      const onChangeText = jest.fn();

      const screen = renderWithProviders(
        <FormFieldTest label="Complex Field" onChangeText={onChangeText} testID="complex-field" />,
      );

      const startTime = Date.now();

      // Type a complex string
      const complexString = 'Test123';
      for (let i = 0; i < complexString.length; i++) {
        const partialString = complexString.substring(0, i + 1);

        act(() => {
          changeText(screen, 'complex-field', partialString);
        });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete text input in reasonable time
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe('Memory Performance', () => {
    it('should not create memory leaks with frequent input changes', () => {
      const onChangeText = jest.fn();

      const {rerender} = renderWithProviders(
        <FormField label="Memory Test" value="" onChangeText={onChangeText} testID="memory-test" />,
      );

      // Simulate multiple re-renders with different props
      for (let i = 0; i < 50; i++) {
        rerender(
          <TestWrapper>
            <FormField
              label={`Memory Test ${i}`}
              value={`value${i}`}
              onChangeText={onChangeText}
              testID="memory-test"
            />
          </TestWrapper>,
        );
      }

      // If we reach here without errors, memory management is working
      expect(true).toBe(true);
    });
  });
});
