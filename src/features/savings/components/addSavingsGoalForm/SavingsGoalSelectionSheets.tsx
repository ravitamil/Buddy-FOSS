import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {RecurrenceFrequency} from '@/types';
import {
  RECURRENCE_FREQUENCIES,
  SAVINGS_CATEGORIES,
  type SavingsCategoryOption,
} from '@/features/savings/hooks/useAddSavingsGoalScreen';
import type {SavingsGoalIoniconName} from './types';

export const CategorySelectionSheet = ({
  currentCategoryName,
  onCategorySelect,
  onOpenChange,
  open,
}: {
  currentCategoryName: string;
  isDarkMode: boolean;
  onCategorySelect: (category: SavingsCategoryOption) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => (
  <BottomSheet
    open={open}
    onOpenChange={onOpenChange}
    snapPoints={[60]}
    title="Select Category"
    description="Choose how this savings goal should be grouped">
    {SAVINGS_CATEGORIES.map((category) => (
      <BottomSheetOption
        key={category.name}
        label={category.name}
        selected={currentCategoryName === category.name}
        leading={
          <Ionicons
            name={category.icons[0] as SavingsGoalIoniconName}
            size={24}
            color={category.color}
          />
        }
        onPress={() => onCategorySelect(category)}
      />
    ))}
  </BottomSheet>
);

export const FrequencySelectionSheet = ({
  currentFrequency,
  onFrequencySelect,
  onOpenChange,
  open,
}: {
  currentFrequency: RecurrenceFrequency;
  isDarkMode: boolean;
  onFrequencySelect: (frequency: RecurrenceFrequency) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => (
  <BottomSheet
    open={open}
    onOpenChange={onOpenChange}
    snapPoints={[60]}
    title="Select Frequency"
    description="Choose how often money is added to this savings goal">
    {RECURRENCE_FREQUENCIES.map((frequency) => (
      <BottomSheetOption
        key={frequency.value}
        label={frequency.label}
        selected={currentFrequency === frequency.value}
        onPress={() => onFrequencySelect(frequency.value)}
      />
    ))}
  </BottomSheet>
);
