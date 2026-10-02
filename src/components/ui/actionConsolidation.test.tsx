import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
}));

import {FloatingAction} from '@ravitamil/buddy-ui';
import {IconAction} from '@ravitamil/buddy-ui';

describe('consolidated actions', () => {
  it('exposes icon actions with their label and disabled state', () => {
    const onPress = jest.fn();
    const {getByLabelText} = render(
      <IconAction icon="add" label="Add expense" onPress={onPress} disabled />,
    );

    const action = getByLabelText('Add expense');
    expect(action.props.accessibilityState).toEqual({disabled: true});
  });

  it('exposes loading save actions as busy and disabled', () => {
    const {getByLabelText, getByText} = render(
      <FloatingAction
        presentation="save"
        icon="checkmark"
        label="Save budget"
        loading
        onPress={jest.fn()}
      />,
    );

    const button = getByLabelText('Save budget');
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
    expect(getByText('Saving...')).toBeTruthy();
  });

  it('supports tab-bar clearance for circular actions', () => {
    const {getByTestId} = render(
      <FloatingAction
        testID="circular-action"
        presentation="circular"
        variant="info"
        label="Create group"
        bottomOffset={80}
        onPress={jest.fn()}
      />,
    );

    const container = getByTestId('circular-action');
    const rawStyle = container.props.style as unknown;
    const stylesList = Array.isArray(rawStyle)
      ? (rawStyle.flat(5) as Array<Record<string, unknown> | undefined>)
      : [rawStyle as Record<string, unknown> | undefined];
    const match = stylesList.find((s) => Boolean(s && s.bottom !== undefined));
    expect(match?.bottom).toBe(104);
  });
});
