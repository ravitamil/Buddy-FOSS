import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {SettingsQuickCard} from './SettingsQuickCard';

describe('SettingsQuickCard', () => {
  it('renders standard quick card and fires onPress', () => {
    const onPress = jest.fn();
    const {getByText, getByLabelText} = render(
      <SettingsQuickCard label="USD" symbol="$" isDarkMode={false} onPress={onPress} />,
    );

    expect(getByText('USD')).toBeTruthy();
    expect(getByText('$')).toBeTruthy();
    fireEvent.press(getByLabelText('USD'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders animated theme quick card with isThemeCard prop', () => {
    const onPress = jest.fn();
    const {getByText, getByLabelText} = render(
      <SettingsQuickCard
        label="Dark"
        icon="moon"
        isThemeCard
        isDarkMode={true}
        onPress={onPress}
      />,
    );

    expect(getByText('Dark')).toBeTruthy();
    fireEvent.press(getByLabelText('Dark'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders animated theme quick card in light mode when icon is sunny', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <SettingsQuickCard label="Light" icon="sunny" isDarkMode={false} onPress={onPress} />,
    );

    expect(getByText('Light')).toBeTruthy();
  });
});
