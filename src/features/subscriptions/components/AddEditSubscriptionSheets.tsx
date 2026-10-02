import {BottomSheet, BottomSheetOption} from '@ravitamil/buddy-ui/overlays';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import type {AddEditSubscriptionScreenState} from '../hooks/useAddEditSubscriptionScreen';
import {BILLING_CYCLES, SUBSCRIPTION_CATEGORIES} from '../types';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface AddEditSubscriptionSheetsProps {
  screen: AddEditSubscriptionScreenState;
  isDarkMode: boolean;
}

export function AddEditSubscriptionSheets({screen, isDarkMode}: AddEditSubscriptionSheetsProps) {
  return (
    <>
      <BillingCycleSheet screen={screen} isDarkMode={isDarkMode} />
      <ReminderDaysSheet screen={screen} isDarkMode={isDarkMode} />
      <CategorySheet screen={screen} isDarkMode={isDarkMode} />
    </>
  );
}

function BillingCycleSheet({screen}: AddEditSubscriptionSheetsProps) {
  return (
    <BaseSheet
      open={screen.showBillingCycleDropdown}
      onOpenChange={screen.setShowBillingCycleDropdown}
      title="Select Billing Cycle"
      snapPoints={[50, 35]}
      defaultPosition={0}>
      {BILLING_CYCLES.map((cycle) => {
        const selected = screen.formData.billingCycle === cycle.value;

        return (
          <BottomSheetOption
            key={cycle.value}
            label={cycle.label}
            selected={selected}
            onPress={() => {
              screen.updateForm({billingCycle: cycle.value});
              screen.setShowBillingCycleDropdown(false);
            }}
          />
        );
      })}
    </BaseSheet>
  );
}

function ReminderDaysSheet({screen}: AddEditSubscriptionSheetsProps) {
  return (
    <BaseSheet
      open={screen.showReminderDaysDropdown}
      onOpenChange={screen.setShowReminderDaysDropdown}
      title="Reminder Days"
      snapPoints={[65, 45]}
      defaultPosition={0}>
      {[1, 2, 3, 5, 7, 14, 30].map((days) => {
        const selected = screen.formData.reminderDaysBefore === days;

        return (
          <BottomSheetOption
            key={days}
            label={`${days} day${days !== 1 ? 's' : ''} before`}
            selected={selected}
            onPress={() => {
              screen.updateForm({reminderDaysBefore: days});
              screen.setShowReminderDaysDropdown(false);
            }}
          />
        );
      })}
    </BaseSheet>
  );
}

function CategorySheet({screen}: AddEditSubscriptionSheetsProps) {
  return (
    <BaseSheet
      open={screen.showCategoryDropdown}
      onOpenChange={screen.setShowCategoryDropdown}
      title="Select Category"
      snapPoints={[80, 50]}
      defaultPosition={0}>
      {SUBSCRIPTION_CATEGORIES.map((category) => {
        const selected = screen.selectedCategory === category.name;

        return (
          <BottomSheetOption
            key={category.name}
            label={category.name}
            selected={selected}
            leading={
              <View
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={`${category.color}30`}
                justifyContent="center"
                alignItems="center">
                <Ionicons
                  name={category.icons[0] as IoniconName}
                  size={20}
                  color={category.color}
                />
              </View>
            }
            onPress={() => {
              screen.handleCategorySelect(category);
              screen.setShowCategoryDropdown(false);
            }}
          />
        );
      })}
    </BaseSheet>
  );
}

function BaseSheet({
  children,
  open,
  onOpenChange,
  title,
  snapPoints,
  defaultPosition,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  snapPoints: number[];
  defaultPosition: number;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      defaultPosition={defaultPosition}
      scrollable
      title={title}
      description="Choose an option for this subscription">
      {children}
    </BottomSheet>
  );
}
