import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {GlassSurface, SelectField, Text} from '@ravitamil/buddy-ui';
import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {XStack, YStack} from 'tamagui';

import {ScreenWrapper} from '@/components/ui/ScreenWrapper';
import {OnboardingActionBar, OnboardingStepHeader, ThemedIonicon} from './OnboardingStepChrome';

interface ModernDateOfBirthStepProps {
  dateOfBirth: Date;
  onDateChange: (date: Date) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

interface DateSelectProps {
  label: string;
  value?: string;
  placeholder?: string;
  options: readonly string[];
  onSelect: (value: string) => void;
  flex?: number;
}

const MONTHS = [
  {value: '01', shortLabel: 'Jan', longLabel: 'January'},
  {value: '02', shortLabel: 'Feb', longLabel: 'February'},
  {value: '03', shortLabel: 'Mar', longLabel: 'March'},
  {value: '04', shortLabel: 'Apr', longLabel: 'April'},
  {value: '05', shortLabel: 'May', longLabel: 'May'},
  {value: '06', shortLabel: 'Jun', longLabel: 'June'},
  {value: '07', shortLabel: 'Jul', longLabel: 'July'},
  {value: '08', shortLabel: 'Aug', longLabel: 'August'},
  {value: '09', shortLabel: 'Sep', longLabel: 'September'},
  {value: '10', shortLabel: 'Oct', longLabel: 'October'},
  {value: '11', shortLabel: 'Nov', longLabel: 'November'},
  {value: '12', shortLabel: 'Dec', longLabel: 'December'},
] as const;

function DateSelect({label, value, placeholder, options, onSelect, flex = 1}: DateSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <YStack flex={flex}>
      <SelectField
        label={label}
        value={value}
        placeholder={placeholder}
        onPress={() => setOpen(true)}
      />
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        snapPoints={[70]}
        scrollable
        title={`Choose ${label.toLowerCase()}`}
        description="Your selection stays private in your Buddy profile.">
        {options.map((item) => (
          <BottomSheetOption
            key={item}
            label={item}
            selected={item === value}
            onPress={() => {
              onSelect(item);
              setOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </YStack>
  );
}

const initialDatePart = (dateOfBirth: Date, part: 'day' | 'month' | 'year') => {
  const today = new Date();
  if (dateOfBirth.toDateString() === today.toDateString()) return '';

  if (part === 'day') return String(dateOfBirth.getDate()).padStart(2, '0');
  if (part === 'month') return String(dateOfBirth.getMonth() + 1).padStart(2, '0');
  return String(dateOfBirth.getFullYear());
};

export const ModernDateOfBirthStep: React.FC<ModernDateOfBirthStepProps> = ({
  dateOfBirth,
  onDateChange,
  onNext,
  onBack,
  errors,
}) => {
  const [selectedDay, setSelectedDay] = useState(() => initialDatePart(dateOfBirth, 'day'));
  const [selectedMonth, setSelectedMonth] = useState(() => initialDatePart(dateOfBirth, 'month'));
  const [selectedYear, setSelectedYear] = useState(() => initialDatePart(dateOfBirth, 'year'));

  useEffect(() => {
    const day = initialDatePart(dateOfBirth, 'day');
    const month = initialDatePart(dateOfBirth, 'month');
    const year = initialDatePart(dateOfBirth, 'year');
    if (day) setSelectedDay(day);
    if (month) setSelectedMonth(month);
    if (year) setSelectedYear(year);
  }, [dateOfBirth]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({length: 100}, (_, index) => String(currentYear - index)),
    [currentYear],
  );
  const daysInMonth = useCallback(
    (month: string, year: string) => {
      if (!month) return 31;
      return new Date(Number(year || currentYear), Number(month), 0).getDate();
    },
    [currentYear],
  );
  const days = useMemo(
    () =>
      Array.from({length: daysInMonth(selectedMonth, selectedYear)}, (_, index) =>
        String(index + 1).padStart(2, '0'),
      ),
    [daysInMonth, selectedMonth, selectedYear],
  );

  const updateDate = useCallback(
    (field: 'day' | 'month' | 'year', value: string) => {
      let day = field === 'day' ? value : selectedDay;
      const month = field === 'month' ? value : selectedMonth;
      const year = field === 'year' ? value : selectedYear;

      if (field === 'day') setSelectedDay(value);
      if (field === 'month') setSelectedMonth(value);
      if (field === 'year') setSelectedYear(value);

      if (day && month && year && Number(day) > daysInMonth(month, year)) {
        day = '';
        setSelectedDay('');
      }

      if (day && month && year) {
        onDateChange(new Date(Number(year), Number(month) - 1, Number(day)));
      }
    },
    [daysInMonth, onDateChange, selectedDay, selectedMonth, selectedYear],
  );

  const isComplete = Boolean(selectedDay && selectedMonth && selectedYear);
  const selectedDate = isComplete
    ? new Date(Number(selectedYear), Number(selectedMonth) - 1, Number(selectedDay))
    : null;
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const isOldEnough = Boolean(selectedDate && selectedDate <= eighteenYearsAgo);
  const month = MONTHS.find((item) => item.value === selectedMonth);
  const preview = selectedDate
    ? `${month?.longLabel ?? ''} ${Number(selectedDay)}, ${selectedYear}`
    : 'Choose month, day and year';
  const dateError =
    errors.dateOfBirth || (isComplete && !isOldEnough ? 'You must be at least 18 years old' : '');

  return (
    <YStack flex={1}>
      <ScreenWrapper
        edges={[]}
        useSafeArea={false}
        backgroundColor="transparent"
        padding={false}
        keyboardMode="none"
        contentContainerStyle={{paddingBottom: 20, flexGrow: 1}}>
        <YStack gap="$4" paddingHorizontal="$4">
          <OnboardingStepHeader
            currentStep={1}
            title="Date of birth"
            subtitle="Your age helps us keep the experience appropriate. We never show your birthday publicly."
          />

          <GlassSurface padding={18} testID="onboarding-birthday-card">
            <YStack gap="$5">
              <YStack alignItems="center" gap="$2" paddingVertical="$2">
                <YStack
                  width={76}
                  height={76}
                  borderRadius={38}
                  backgroundColor="$glassSurfaceFill"
                  borderWidth={1}
                  borderColor="$glassSurfaceBorder"
                  alignItems="center"
                  justifyContent="center">
                  <ThemedIonicon name="gift-outline" size={34} color="$iconBrand" />
                </YStack>
                <Text variant="h4" weight="semibold" align="center" color="$text">
                  {preview}
                </Text>
                {selectedDate && isOldEnough ? (
                  <Text variant="caption" color="$iconBrand" weight="semibold" align="center">
                    ✓ Age eligible to continue
                  </Text>
                ) : (
                  <Text variant="caption" color="$textSecondary" align="center">
                    You need to be 18 or older to continue.
                  </Text>
                )}
              </YStack>

              <XStack gap="$2.5" width="100%">
                <DateSelect
                  label="Month"
                  value={month?.shortLabel}
                  placeholder="MMM"
                  options={MONTHS.map((item) => item.shortLabel)}
                  onSelect={(value) => {
                    const selected = MONTHS.find((item) => item.shortLabel === value);
                    if (selected) updateDate('month', selected.value);
                  }}
                  flex={1.2}
                />
                <DateSelect
                  label="Day"
                  value={selectedDay}
                  placeholder="DD"
                  options={days}
                  onSelect={(value) => updateDate('day', value)}
                  flex={1}
                />
                <DateSelect
                  label="Year"
                  value={selectedYear}
                  placeholder="YYYY"
                  options={years}
                  onSelect={(value) => updateDate('year', value)}
                  flex={1.2}
                />
              </XStack>

              {dateError ? (
                <Text
                  variant="caption"
                  color="$error"
                  align="center"
                  accessibilityLiveRegion="polite">
                  {dateError}
                </Text>
              ) : null}

              <XStack
                gap="$2.5"
                alignItems="center"
                backgroundColor="$surfacePress"
                borderRadius="$4"
                padding="$3">
                <ThemedIonicon name="lock-closed-outline" size={19} color="$iconBrand" />
                <Text variant="body2" color="$textSecondary" flex={1}>
                  Stored securely and used only for profile eligibility.
                </Text>
              </XStack>
            </YStack>
          </GlassSurface>
        </YStack>
      </ScreenWrapper>

      <OnboardingActionBar
        onBack={onBack}
        onContinue={onNext}
        continueDisabled={!isComplete || !isOldEnough}
      />
    </YStack>
  );
};
