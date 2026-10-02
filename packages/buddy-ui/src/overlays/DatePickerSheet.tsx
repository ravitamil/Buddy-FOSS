import React, {useEffect, useMemo, useState} from 'react';
import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {Platform} from 'react-native';
import {YStack, useTheme} from 'tamagui';

import {Button} from '../Button';
import {HStack} from '../Box';
import {resolveThemeColor} from '../utils';
import {BottomSheet} from './BottomSheet';

export interface DatePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  value?: Date;
  title?: string;
  description?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePickerSheet({
  open,
  onOpenChange,
  onConfirm,
  value,
  title = 'Select date',
  description = 'Choose a date',
  minimumDate,
  maximumDate,
}: DatePickerSheetProps) {
  const valueTime = value?.getTime();
  const normalizedValue = useMemo(() => {
    let date =
      valueTime === undefined || Number.isNaN(valueTime) ? new Date() : new Date(valueTime);
    if (minimumDate && date < minimumDate) date = minimumDate;
    if (maximumDate && date > maximumDate) date = maximumDate;
    return date;
  }, [valueTime, minimumDate, maximumDate]);

  const [selected, setSelected] = useState(normalizedValue);
  const theme = useTheme();

  useEffect(() => {
    if (open) setSelected(normalizedValue);
  }, [normalizedValue, open]);

  const changeDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      onOpenChange(false);
      if (event.type === 'set' && date) {
        setSelected(date);
        onConfirm(date);
      }
    } else {
      if (date) setSelected(date);
    }
  };

  if (Platform.OS === 'android') {
    if (!open) return null;
    return (
      <DateTimePicker
        value={selected}
        mode="date"
        display="default"
        onChange={changeDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    );
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[45]}
      title={title}
      description={description}>
      <YStack gap="$4" alignItems="center">
        <DateTimePicker
          value={selected}
          mode="date"
          display="spinner"
          onChange={changeDate}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          textColor={resolveThemeColor(theme, 'text', '#111827')}
        />
        <HStack gap="$3" width="100%">
          <Button flex={1} variant="outline" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            flex={1}
            onPress={() => {
              onConfirm(selected);
              onOpenChange(false);
            }}>
            Confirm
          </Button>
        </HStack>
      </YStack>
    </BottomSheet>
  );
}
