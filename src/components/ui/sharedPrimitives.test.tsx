import mockReact from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import {QuickActionPanel} from '@ravitamil/buddy-ui';
import {SettingsItem} from './SettingsItem';

const TestText = ({children, ...props}: mockReact.PropsWithChildren<Record<string, unknown>>) =>
  mockReact.createElement('Text', props, children);

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({isDarkMode: false}),
}));

describe('shared UI primitives', () => {
  it('renders SettingsItem variants and right-side content', () => {
    const {getByText, rerender, queryByText} = render(
      <SettingsItem icon="settings-outline" title="Default row" value="Enabled" />,
    );

    expect(getByText('Default row')).toBeTruthy();
    expect(getByText('Enabled')).toBeTruthy();

    rerender(
      <SettingsItem
        icon="trash-outline"
        title="Danger row"
        variant="danger"
        rightElement={<SettingsItemRightLabel label="Custom" />}
        disabled
      />,
    );

    expect(getByText('Danger row')).toBeTruthy();
    expect(getByText('Custom')).toBeTruthy();
    expect(queryByText('Enabled')).toBeNull();
  });

  it('fires QuickActionPanel action callbacks', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <QuickActionPanel
        actions={[
          {
            title: 'Add',
            icon: 'add-circle-outline',
            color: '#3b82f6',
            onPress,
          },
        ]}
      />,
    );

    fireEvent.press(getByText('Add'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

const SettingsItemRightLabel = ({label}: {label: string}) => <TestText>{label}</TestText>;
