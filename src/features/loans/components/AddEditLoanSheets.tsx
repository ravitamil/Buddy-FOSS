import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import React from 'react';
import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {LoanType} from '@/types/loan.types';
import {
  INTEREST_TYPE_OPTIONS,
  LENDER_TYPE_OPTIONS,
  LOAN_TYPE_CONFIG,
  PAYOFF_STRATEGY_OPTIONS,
  REMINDER_DAYS_OPTIONS,
  type SelectOption,
} from '../types/addEditLoanForm';
import type {UseAddEditLoanScreenResult} from '../hooks/useAddEditLoanScreen';

interface AddEditLoanSheetsProps {
  screen: UseAddEditLoanScreenResult;
}

const SelectionSheet = ({
  open,
  onOpenChange,
  title,
  snapPoints,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  snapPoints: number[];
  children: React.ReactNode;
}) => (
  <BottomSheet
    open={open}
    onOpenChange={onOpenChange}
    snapPoints={snapPoints}
    scrollable
    title={title}
    description="Choose the option that applies to this loan">
    {children}
  </BottomSheet>
);

export const AddEditLoanSheets = ({screen}: AddEditLoanSheetsProps) => (
  <>
    <SelectionSheet
      open={screen.showLoanTypeSheet}
      onOpenChange={screen.setShowLoanTypeSheet}
      title="Select Loan Type"
      snapPoints={[60]}>
      {Object.entries(LOAN_TYPE_CONFIG).map(([key, config]) => {
        const loanType = key as LoanType;
        const selected = screen.formData.loanType === loanType;

        return (
          <BottomSheetOption
            key={loanType}
            label={config.displayName}
            description={`Max tenure: ${config.maxTenure} months`}
            selected={selected}
            leading={<Ionicons name={config.icon} size={24} color={config.color} />}
            onPress={() => {
              screen.updateFormData('loanType', loanType);
              screen.setShowLoanTypeSheet(false);
            }}
          />
        );
      })}
    </SelectionSheet>

    <TypedOptionSheet
      open={screen.showPayoffStrategySheet}
      onOpenChange={screen.setShowPayoffStrategySheet}
      title="Select Payoff Strategy"
      snapPoints={[45]}
      options={PAYOFF_STRATEGY_OPTIONS}
      selectedValue={screen.formData.payoffStrategy}
      onSelect={(value) => {
        screen.updateFormData('payoffStrategy', value);
        screen.setShowPayoffStrategySheet(false);
      }}
    />

    <TypedOptionSheet
      open={screen.showLenderTypeSheet}
      onOpenChange={screen.setShowLenderTypeSheet}
      title="Select Lender Type"
      snapPoints={[60]}
      options={LENDER_TYPE_OPTIONS}
      selectedValue={screen.formData.lenderType}
      onSelect={(value) => {
        screen.updateFormData('lenderType', value);
        screen.setShowLenderTypeSheet(false);
      }}
    />

    <SelectionSheet
      open={screen.showReminderSheet}
      onOpenChange={screen.setShowReminderSheet}
      title="Reminder Days Before EMI"
      snapPoints={[60]}>
      {REMINDER_DAYS_OPTIONS.map((days) => (
        <BottomSheetOption
          key={days}
          label={`${days} ${days === 1 ? 'day' : 'days'} before`}
          selected={screen.formData.reminderDaysBefore === days}
          onPress={() => {
            screen.updateFormData('reminderDaysBefore', days);
            screen.setShowReminderSheet(false);
          }}
        />
      ))}
    </SelectionSheet>

    <TypedOptionSheet
      open={screen.showInterestTypeSheet}
      onOpenChange={screen.setShowInterestTypeSheet}
      title="Select Interest Type"
      snapPoints={[40]}
      options={INTEREST_TYPE_OPTIONS}
      selectedValue={screen.formData.interestType}
      onSelect={(value) => {
        screen.updateFormData('interestType', value);
        screen.setShowInterestTypeSheet(false);
      }}
    />

    {screen.showDatePicker ? <LoanDatePicker screen={screen} /> : null}
  </>
);

const TypedOptionSheet = <T extends string>({
  open,
  onOpenChange,
  title,
  snapPoints,
  options,
  selectedValue,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  snapPoints: number[];
  options: Array<SelectOption<T>>;
  selectedValue?: string;
  onSelect: (value: T) => void;
}) => (
  <SelectionSheet open={open} onOpenChange={onOpenChange} title={title} snapPoints={snapPoints}>
    {options.map((item) => {
      const selected = selectedValue === item.key;

      return (
        <BottomSheetOption
          key={item.key}
          label={item.label}
          description={item.description}
          selected={selected}
          onPress={() => onSelect(item.key)}
        />
      );
    })}
  </SelectionSheet>
);

const LoanDatePicker = ({screen}: AddEditLoanSheetsProps) => {
  const rawValue = screen.formData[screen.datePickerField];
  const value = rawValue ? new Date(rawValue) : new Date();
  const safeValue = Number.isNaN(value.getTime()) ? new Date() : value;

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    screen.setSelectedDate(selectedDate);
  };

  return <DateTimePicker value={safeValue} mode="date" display="default" onChange={handleChange} />;
};
