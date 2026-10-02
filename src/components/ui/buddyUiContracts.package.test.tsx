import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
}));

import {
  ActionGrid,
  EmptyState,
  GlassSurface,
  IconAction,
  SegmentedControl,
  Switch,
  ToggleField,
} from '@ravitamil/buddy-ui';

describe('@ravitamil/buddy-ui portable contracts', () => {
  it('exposes a controlled accessible switch', () => {
    const onCheckedChange = jest.fn();
    const screen = render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        accessibilityLabel="Notifications"
      />,
    );

    fireEvent(screen.getByLabelText('Notifications'), 'checkedChange', true);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText('Notifications').props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
  });

  it('composes toggle labels and descriptions without application context', () => {
    const screen = render(
      <ToggleField
        title="Automatic backup"
        description="Back up changes securely"
        checked
        onCheckedChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Automatic backup')).toBeTruthy();
    expect(screen.getByText('Back up changes securely')).toBeTruthy();
  });

  it('uses string values and tab semantics for segmented controls', () => {
    const onValueChange = jest.fn();
    const screen = render(
      <SegmentedControl
        value="month"
        selectedTone="info"
        onValueChange={onValueChange}
        options={[
          {label: 'Month', value: 'month'},
          {label: 'Year', value: 'year'},
          {label: 'Subscriptions', value: 'subscriptions'},
        ]}
      />,
    );

    fireEvent.press(screen.getByLabelText('Year'));

    expect(onValueChange).toHaveBeenCalledWith('year');
    const monthState: unknown = screen.getByLabelText('Month').props.accessibilityState;
    expect(monthState).toEqual({selected: true});
    expect(screen.getByText('Subscriptions').props.numberOfLines).toBe(1);
  });

  it('keeps glass wash and action contracts product-neutral', () => {
    const onPress = jest.fn();
    const screen = render(
      <GlassSurface testID="surface" washColor="#15803d">
        <IconAction icon="add" label="Create" tone="success" onPress={onPress} />
      </GlassSurface>,
    );

    fireEvent.press(screen.getByLabelText('Create'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('surface-wash')).toBeTruthy();
  });

  it('supports shared empty states and semantic action grids', () => {
    const screen = render(
      <>
        <EmptyState
          title="Nothing here"
          description="Create your first item"
          icon="add"
          iconColor="#047857"
        />
        <ActionGrid
          primaryActions={[
            {label: 'Edit', icon: 'create', onPress: jest.fn(), tone: 'info'},
            {label: 'Delete', icon: 'trash', onPress: jest.fn(), tone: 'danger'},
          ]}
          secondaryAction={{label: 'Share', icon: 'share', onPress: jest.fn()}}
        />
      </>,
    );

    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
  });
});
