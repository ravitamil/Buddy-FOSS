import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {Text, View} from 'react-native';

import {ToggleRow} from './AddEditSubscriptionControls';

function mockStack({children}: {children?: React.ReactNode}) {
  return <View>{children}</View>;
}

function mockText({children}: {children?: React.ReactNode}) {
  return <Text>{children}</Text>;
}

function mockIcon() {
  return <View />;
}

jest.mock('@/components/ui', () => {
  return {
    HStack: mockStack,
    Text: mockText,
    VStack: mockStack,
  };
});

jest.mock('@ravitamil/buddy-ui/icons/AppIcon', () => ({
  Ionicons: mockIcon,
}));

describe('ToggleRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redraws its controlled state when the value changes', () => {
    const {getByLabelText, rerender} = render(
      <ToggleRow
        icon="card"
        iconColor="#4CAF50"
        title="Auto-Pay"
        subtitle="Automatically track payments when due"
        enabled={false}
        enabledColor="#4CAF50"
        onPress={jest.fn()}
      />,
    );

    expect(getByLabelText('Auto-Pay').props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });

    rerender(
      <ToggleRow
        icon="card"
        iconColor="#4CAF50"
        title="Auto-Pay"
        subtitle="Automatically track payments when due"
        enabled
        enabledColor="#4CAF50"
        onPress={jest.fn()}
      />,
    );

    expect(getByLabelText('Auto-Pay').props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    });
  });

  it('reports its state and invokes the supplied action', () => {
    const onPress = jest.fn();
    const {getByLabelText} = render(
      <ToggleRow
        icon="notifications"
        iconColor="#2196F3"
        title="Reminders"
        subtitle="Get notified before payment is due"
        enabled
        enabledColor="#2196F3"
        onPress={onPress}
      />,
    );

    const reminders = getByLabelText('Reminders');
    expect(reminders.props.accessibilityState).toEqual({checked: true, disabled: false});

    fireEvent.press(reminders);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
