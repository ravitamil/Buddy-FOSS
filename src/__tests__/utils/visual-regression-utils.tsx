/**
 * Visual Regression Testing Utilities
 * Tools for testing UI component visual consistency
 */

import React from 'react';
import {render} from '@testing-library/react-native';
import {Dimensions, Text} from 'react-native';
import {TamaguiProvider} from 'tamagui';
import config from '../../../tamagui.config';

type ThemeName = 'light' | 'dark';
type VisualProps = Record<string, unknown>;
type Snapshot = unknown;
type SnapshotMap = Record<string, Snapshot>;
type ScreenSize = {width: number; height: number};
type AccessibilityProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  testID?: string;
};

const renderSnapshot = <Props extends VisualProps>(
  Component: React.ComponentType<Props>,
  props: Props,
  theme: ThemeName = 'light',
): Snapshot => {
  const {toJSON} = render(
    <VisualTestWrapper theme={theme}>
      <Component {...props} />
    </VisualTestWrapper>,
  );

  return toJSON();
};

const toScaledSize = ({width, height}: ScreenSize) => ({
  width,
  height,
  scale: 1,
  fontScale: 1,
});

const stringifyPropValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  if (value == null) {
    return String(value);
  }

  return JSON.stringify(value);
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

// Visual testing wrapper
const VisualTestWrapper = ({
  children,
  theme = 'light',
}: {
  children: React.ReactNode;
  theme?: ThemeName;
}) => (
  <TamaguiProvider config={config} defaultTheme={theme}>
    {children}
  </TamaguiProvider>
);

// Visual regression test utilities
export const visualRegression = {
  // Capture component snapshot in different states
  captureComponentStates: <Props extends VisualProps>(
    Component: React.ComponentType<Props>,
    baseProps: Props,
    states: Record<string, Partial<Props>>,
  ): SnapshotMap => {
    const snapshots: SnapshotMap = {};

    Object.entries(states).forEach(([stateName, stateProps]) => {
      snapshots[stateName] = renderSnapshot(Component, {
        ...baseProps,
        ...stateProps,
      });
    });

    return snapshots;
  },

  // Capture component in different themes
  captureThemeVariations: <Props extends VisualProps>(
    Component: React.ComponentType<Props>,
    props: Props,
  ): SnapshotMap => {
    const themes = ['light', 'dark'] as const;
    const snapshots: SnapshotMap = {};

    themes.forEach((theme) => {
      snapshots[theme] = renderSnapshot(Component, props, theme);
    });

    return snapshots;
  },

  // Capture component at different screen sizes
  captureResponsiveVariations: <Props extends VisualProps>(
    Component: React.ComponentType<Props>,
    props: Props,
    screenSizes: Record<string, ScreenSize>,
  ): SnapshotMap => {
    const snapshots: SnapshotMap = {};

    Object.entries(screenSizes).forEach(([sizeName, dimensions]) => {
      const dimensionsGetSpy = jest
        .spyOn(Dimensions, 'get')
        .mockReturnValue(toScaledSize(dimensions));

      snapshots[sizeName] = renderSnapshot(Component, props);

      dimensionsGetSpy.mockRestore();
    });

    return snapshots;
  },

  // Test component with different prop combinations
  capturePropsMatrix: <Props extends VisualProps>(
    Component: React.ComponentType<Props>,
    propsMatrix: {[Key in keyof Props]?: Props[Key][]},
  ): SnapshotMap => {
    const snapshots: SnapshotMap = {};
    const propKeys = Object.keys(propsMatrix);

    // Generate all combinations
    const generateCombinations = (
      keys: string[],
      index = 0,
      current: Partial<Props> = {},
    ): Props[] => {
      if (index === keys.length) {
        return [current as Props];
      }

      const key = keys[index] as keyof Props;
      const values = propsMatrix[key] ?? [];
      const combinations: Props[] = [];

      values.forEach((value) => {
        const newCurrent = {...current, [key]: value};
        combinations.push(...generateCombinations(keys, index + 1, newCurrent));
      });

      return combinations;
    };

    const combinations = generateCombinations(propKeys);

    combinations.forEach((props, index) => {
      const combinationName =
        Object.entries(props)
          .map(([key, value]) => `${key}-${stringifyPropValue(value)}`)
          .join('_') || `combination-${index}`;

      snapshots[combinationName] = renderSnapshot(Component, props);
    });

    return snapshots;
  },
};

// Common screen sizes for responsive testing
export const screenSizes = {
  mobile: {width: 375, height: 812},
  mobileLarge: {width: 414, height: 896},
  tablet: {width: 768, height: 1024},
  tabletLarge: {width: 1024, height: 1366},
};

// Common component states for testing
export const componentStates = {
  button: {
    default: {},
    disabled: {disabled: true},
    loading: {loading: true},
    pressed: {pressed: true},
  },
  input: {
    default: {value: ''},
    withValue: {value: 'Sample text'},
    withError: {value: 'Invalid', error: 'This field is required'},
    disabled: {disabled: true},
    focused: {focused: true},
  },
  modal: {
    closed: {visible: false},
    open: {visible: true},
    loading: {visible: true, loading: true},
  },
  list: {
    empty: {data: []},
    withItems: {
      data: Array.from({length: 5}, (_, i) => ({
        id: i,
        title: `Item ${i}`,
        description: `Description ${i}`,
      })),
    },
    loading: {loading: true},
  },
};

// Visual testing helpers
export const visualHelpers = {
  // Create test data for components
  createTestData: {
    user: (overrides: VisualProps = {}) => ({
      id: 'test-user-1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
      ...overrides,
    }),

    transaction: (overrides: VisualProps = {}) => ({
      id: 'test-transaction-1',
      amount: 25.5,
      description: 'Coffee Shop',
      category: 'Food & Dining',
      date: '2024-01-15T10:30:00Z',
      type: 'expense',
      ...overrides,
    }),

    group: (overrides: VisualProps = {}) => ({
      id: 'test-group-1',
      name: 'Roommates',
      members: ['user1', 'user2', 'user3'],
      totalExpenses: 1250.75,
      yourBalance: -125.25,
      ...overrides,
    }),

    budget: (overrides: VisualProps = {}) => ({
      id: 'test-budget-1',
      category: 'Food & Dining',
      budgetAmount: 500,
      spentAmount: 325.5,
      period: 'monthly',
      ...overrides,
    }),
  },

  // Mock different loading states
  mockLoadingStates: {
    initial: {loading: true, data: null, error: null},
    success: {loading: false, data: 'mock-data', error: null},
    error: {loading: false, data: null, error: 'Something went wrong'},
    empty: {loading: false, data: [], error: null},
  },

  // Create component with all accessibility props
  withAccessibility: <Props extends VisualProps & AccessibilityProps>(
    Component: React.ComponentType<Props>,
    props: Props,
  ) => {
    const accessibilityProps = {
      accessible: true,
      accessibilityLabel: props.accessibilityLabel || 'Test component',
      accessibilityHint: props.accessibilityHint || 'Test component hint',
      accessibilityRole: props.accessibilityRole || 'button',
      testID: props.testID || 'test-component',
    };

    return <Component {...props} {...accessibilityProps} />;
  },
};

// Snapshot testing utilities
export const snapshotUtils = {
  // Test component with multiple props at once
  testPropsSnapshot: <Props extends VisualProps>(
    Component: React.ComponentType<Props>,
    testName: string,
    propsArray: Props[],
  ) => {
    propsArray.forEach((props, index) => {
      expect(renderSnapshot(Component, props)).toMatchSnapshot(`${testName}-props-${index}`);
    });
  },

  // Test component in error boundary
  testWithErrorBoundary: <Props extends VisualProps>(
    Component: React.ComponentType<Props>,
    props: Props,
    shouldError = false,
  ): Snapshot => {
    const ErrorBoundary = ({children}: {children: React.ReactNode}) => {
      try {
        return <>{children}</>;
      } catch (error) {
        return <Text>Error caught: {getErrorMessage(error)}</Text>;
      }
    };

    const TestComponent = shouldError
      ? () => {
          throw new Error('Test error');
        }
      : () => <Component {...props} />;

    const {toJSON} = render(
      <VisualTestWrapper>
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      </VisualTestWrapper>,
    );

    return toJSON();
  },

  // Compare snapshots between versions
  compareVersions: <Props extends VisualProps>(
    Component: React.ComponentType<Props>,
    props: Props,
    versions: string[],
  ): SnapshotMap => {
    const snapshots: SnapshotMap = {};

    versions.forEach((version) => {
      snapshots[version] = renderSnapshot(Component, {
        ...props,
        'data-version': version,
      });
    });

    return snapshots;
  },
};

// Export everything
export {VisualTestWrapper};
