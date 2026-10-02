import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

jest.mock('@ravitamil/buddy-ui/icons/AppIcon', () => ({Ionicons: 'View'}));

import {
  bottomSheetChrome,
  BottomSheetAction,
  BottomSheetOption,
} from '@ravitamil/buddy-ui/overlays';

describe('BottomSheet', () => {
  it('provides one consistent sheet chrome contract', () => {
    expect(bottomSheetChrome).toEqual({
      motion: 'quick',
      overlayColor: 'rgba(0, 0, 0, 0.58)',
      radius: 28,
    });
  });

  it('exposes selected option state and press behavior', () => {
    const onPress = jest.fn();
    const {getByLabelText} = render(
      <BottomSheetOption label="Monthly" selected onPress={onPress} />,
    );

    const option = getByLabelText('Monthly');
    expect(option.props.accessibilityState).toEqual({checked: true, disabled: false});
    fireEvent.press(option);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses checkbox semantics for multi-select options', () => {
    const {getByLabelText} = render(
      <BottomSheetOption label="Pending" selectionMode="multiple" selected onPress={jest.fn()} />,
    );

    const option = getByLabelText('Pending');
    expect(option.props.accessibilityRole).toBe('checkbox');
    expect(option.props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    });
  });

  it('provides an accessible destructive action row', () => {
    const onPress = jest.fn();
    const {getByLabelText} = render(
      <BottomSheetAction
        label="Delete card"
        description="Remove this card"
        tone="destructive"
        onPress={onPress}
      />,
    );

    const action = getByLabelText('Delete card');
    expect(action.props.accessibilityHint).toBe('Remove this card');
    fireEvent.press(action);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
