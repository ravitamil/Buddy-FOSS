import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {DayNightThemeSwitch} from './DayNightThemeSwitch';

describe('DayNightThemeSwitch', () => {
  it('renders correctly in light mode with switch accessibility attributes', () => {
    const onCheckedChange = jest.fn();
    const {getByTestId} = render(
      <DayNightThemeSwitch
        checked={false}
        onCheckedChange={onCheckedChange}
        accessibilityLabel="Switch to dark theme"
        testID="theme-switch"
      />,
    );

    const switchElement = getByTestId('theme-switch');
    expect(switchElement).toBeTruthy();
    expect(switchElement.props.accessibilityRole).toBe('switch');
    expect(switchElement.props.accessibilityState).toEqual({checked: false, disabled: false});
    expect(switchElement.props.accessibilityLabel).toBe('Switch to dark theme');
  });

  it('renders correctly in dark mode', () => {
    const onCheckedChange = jest.fn();
    const {getByTestId} = render(
      <DayNightThemeSwitch
        checked={true}
        onCheckedChange={onCheckedChange}
        accessibilityLabel="Switch to light theme"
        testID="theme-switch"
      />,
    );

    const switchElement = getByTestId('theme-switch');
    expect(switchElement.props.accessibilityState).toEqual({checked: true, disabled: false});
  });

  it('fires onCheckedChange with inverse checked state when pressed', () => {
    const onCheckedChange = jest.fn();
    const {getByTestId} = render(
      <DayNightThemeSwitch
        checked={false}
        onCheckedChange={onCheckedChange}
        testID="theme-switch"
      />,
    );

    fireEvent.press(getByTestId('theme-switch'));
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('does not fire onCheckedChange when disabled', () => {
    const onCheckedChange = jest.fn();
    const {getByTestId} = render(
      <DayNightThemeSwitch
        checked={false}
        onCheckedChange={onCheckedChange}
        disabled={true}
        testID="theme-switch"
      />,
    );

    fireEvent.press(getByTestId('theme-switch'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
