import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import {Button} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {YStack, styled} from 'tamagui';

import type {TransactionSortOption} from '../types';

interface SortOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSort: TransactionSortOption;
  onSelectSort: (sort: TransactionSortOption) => void;
}

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

const OptionIconFrame = styled(YStack, {
  name: 'SortOptionIconFrame',
  borderRadius: '$2',
  padding: '$2',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 40,
  minHeight: 40,
  backgroundColor: '$surfacePress',
});

interface SortOptionItem {
  value: TransactionSortOption;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SORT_OPTIONS: SortOptionItem[] = [
  {
    value: 'date-desc',
    label: 'Newest first',
    description: 'Most recent transactions first',
    icon: 'calendar-outline',
  },
  {
    value: 'date-asc',
    label: 'Oldest first',
    description: 'Earliest transactions first',
    icon: 'time-outline',
  },
  {
    value: 'amount-desc',
    label: 'Highest amount',
    description: 'Largest sums first',
    icon: 'trending-up-outline',
  },
  {
    value: 'amount-asc',
    label: 'Lowest amount',
    description: 'Smallest sums first',
    icon: 'trending-down-outline',
  },
];

export function SortOptionsSheet({
  isOpen,
  onClose,
  selectedSort,
  onSelectSort,
}: SortOptionsSheetProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleSelect = (value: TransactionSortOption) => {
    onSelectSort(value);
    onClose();
  };

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      snapPoints={[55]}
      title="Sort Transactions"
      description="Choose how transactions are ordered"
      footer={
        <Button variant="outline" onPress={onClose}>
          Done
        </Button>
      }>
      {SORT_OPTIONS.map((option) => {
        const isSelected = selectedSort === option.value;
        return (
          <BottomSheetOption
            key={option.value}
            label={option.label}
            description={option.description}
            selected={isSelected}
            selectionMode="single"
            leading={
              <OptionIconFrame>
                <ThemedIonicon
                  name={option.icon}
                  size={20}
                  color={isSelected ? '$primary' : '$color'}
                />
              </OptionIconFrame>
            }
            onPress={() => handleSelect(option.value)}
          />
        );
      })}
    </BottomSheet>
  );
}
