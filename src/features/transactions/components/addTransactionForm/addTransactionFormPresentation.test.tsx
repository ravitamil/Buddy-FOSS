import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({isDarkMode: true}),
}));

jest.mock('@ravitamil/buddy-ui/overlays', () => ({
  ...(() => {
    const {Pressable} = jest.requireActual<typeof import('react-native')>('react-native');

    return {
      BottomSheet: ({children, open}: {children: React.ReactNode; open: boolean}) =>
        open ? children : null,
      BottomSheetOption: ({
        label,
        onPress,
        selected,
      }: {
        label: string;
        onPress: () => void;
        selected?: boolean;
      }) => (
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel={label}
          accessibilityState={{selected}}
          onPress={onPress}
        />
      ),
    };
  })(),
}));

import {FloatingSaveButton} from './FloatingSaveButton';
import {RecurrenceSection} from './RecurrenceSection';
import {TransactionHeroAmountCard} from './TransactionHeroAmountCard';
import {TransactionTypeSection} from './TransactionTypeSection';

describe('Add Transaction form presentation', () => {
  it('renders TransactionHeroAmountCard with segmented mode capsule and quick presets', () => {
    const onSelectType = jest.fn();
    const onAddQuickAmount = jest.fn();
    const {getByLabelText, getByText} = render(
      <TransactionHeroAmountCard
        amount="50.00"
        currencyPrefix="$"
        isIncome={false}
        selectedDate={new Date('2026-07-18T00:00:00.000Z')}
        showDatePicker={false}
        transactionType="expense"
        onAddQuickAmount={onAddQuickAmount}
        onAmountChange={jest.fn()}
        onAmountSubmit={jest.fn()}
        onDateChange={jest.fn()}
        onOpenDatePicker={jest.fn()}
        onSelectType={onSelectType}
      />,
    );

    expect(getByLabelText('Select expense transaction type').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByLabelText('Select income transaction type').props.accessibilityState).toEqual({
      selected: false,
    });

    fireEvent.press(getByLabelText('Select income transaction type'));
    expect(onSelectType).toHaveBeenCalledWith('income');

    fireEvent.press(getByLabelText('Add 100'));
    expect(onAddQuickAmount).toHaveBeenCalledWith(100);
  });
  it('exposes the selected transaction type without using selection as the form accent', () => {
    const onSelectType = jest.fn();
    const {getByLabelText, getByTestId} = render(
      <TransactionTypeSection
        isIncome={false}
        transactionType="expense"
        onSelectType={onSelectType}
      />,
    );

    expect(getByLabelText('Select expense transaction type').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByLabelText('Select income transaction type').props.accessibilityState).toEqual({
      selected: false,
    });
    expect(getByTestId('add-transaction-glass-card')).toBeTruthy();

    fireEvent.press(getByLabelText('Select income transaction type'));
    expect(onSelectType).toHaveBeenCalledWith('income');
  });

  it('renders a full-width bottom action with explicit loading and disabled states', () => {
    const onPress = jest.fn();
    const {getByLabelText, getByTestId, getByText, rerender} = render(
      <FloatingSaveButton
        canSave
        isEditMode={false}
        isIncome={false}
        isSaving={false}
        onPress={onPress}
      />,
    );

    expect(getByTestId('transaction-action-bar')).toBeTruthy();
    fireEvent.press(getByLabelText('Save transaction'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getByText('Save Expense')).toBeTruthy();

    rerender(<FloatingSaveButton canSave={false} isEditMode isIncome isSaving onPress={onPress} />);

    expect(getByLabelText('Update transaction').props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
    expect(getByText('Updating Income...')).toBeTruthy();
  });

  it('exposes the recurring switch checked state', () => {
    const onSelectFrequency = jest.fn();
    const {getByLabelText, getByTestId, queryByLabelText} = render(
      <RecurrenceSection
        isRecurring
        recurrenceEndDate={null}
        recurrenceFrequency="monthly"
        recurrenceFrequencies={[
          {value: 'daily', label: 'Daily'},
          {value: 'monthly', label: 'Monthly'},
        ]}
        selectedDate={new Date('2026-07-18T00:00:00.000Z')}
        showRecurrenceEndPicker={false}
        onClearEndDate={jest.fn()}
        onEndDateChange={jest.fn()}
        onOpenEndPicker={jest.fn()}
        onSelectFrequency={onSelectFrequency}
        onToggleRecurring={jest.fn()}
      />,
    );

    expect(getByLabelText('Toggle recurring transaction').props.accessibilityState).toMatchObject({
      checked: true,
    });
    expect(getByTestId('recurring-transaction-switch')).toBeTruthy();
    expect(queryByLabelText('Select Monthly frequency')).toBeNull();

    fireEvent.press(getByLabelText('Choose recurrence frequency, currently Monthly'));
    fireEvent.press(getByLabelText('Monthly'));
    expect(onSelectFrequency).toHaveBeenCalledWith('monthly');
  });
});
