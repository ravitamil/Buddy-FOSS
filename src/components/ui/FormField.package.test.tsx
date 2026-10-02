import React from 'react';
import {render} from '@testing-library/react-native';
import {TamaguiProvider} from 'tamagui';

import {FormField} from '@ravitamil/buddy-ui/FormField';
import config from '../../../tamagui.config';

const renderField = (props: Partial<React.ComponentProps<typeof FormField>> = {}) =>
  render(
    <TamaguiProvider config={config} defaultTheme="light">
      <FormField
        id="email"
        label="Email"
        value="person@example.com"
        onChangeText={jest.fn()}
        {...props}
      />
    </TamaguiProvider>,
  );

describe('package FormField', () => {
  it('associates the label and input through the same id', () => {
    const screen = renderField();

    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByDisplayValue('person@example.com')).toHaveProp('id', 'email');
  });

  it('prioritizes errors and exposes the invalid state', () => {
    const screen = renderField({
      error: 'Enter a valid email',
      warning: 'This address is unusual',
      helpText: 'Used for account recovery',
    });

    expect(screen.getByText('Enter a valid email')).toBeTruthy();
    expect(screen.queryByText('This address is unusual')).toBeNull();
    expect(screen.queryByText('Used for account recovery')).toBeNull();
  });

  it('renders supporting text and a character count without owning validation', () => {
    const screen = renderField({
      value: 'Ravi',
      helpText: 'Use the name people know you by',
      maxLength: 30,
      showCharacterCount: true,
    });

    expect(screen.getByText('Use the name people know you by')).toBeTruthy();
    expect(screen.getByText('4/30')).toBeTruthy();
  });
});
