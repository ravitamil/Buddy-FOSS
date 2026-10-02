import {Button, GlassSurface, HStack, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {router} from 'expo-router';
import React from 'react';
import {useTheme, YStack} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {AddSavingsGoalFormSectionsProps} from './addSavingsGoalForm/types';
import {FinancialDetailsSection} from './addSavingsGoalForm/FinancialDetailsSection';
import {GoalInformationSection} from './addSavingsGoalForm/GoalInformationSection';
import {GoalProgressSection} from './addSavingsGoalForm/GoalProgressSection';
import {RecurringSavingsSection} from './addSavingsGoalForm/RecurringSavingsSection';
import {
  CategorySelectionSheet,
  FrequencySelectionSheet,
} from './addSavingsGoalForm/SavingsGoalSelectionSheets';

export const AddSavingsGoalFormSections = ({
  currentCategory,
  errors,
  formData,
  handleCategorySelect,
  handleDeadlineChange,
  handleFrequencySelect,
  handleRecurrenceEndDateChange,
  handleRecurringChange,
  setShowCategorySheet,
  setShowDatePicker,
  setShowFrequencySheet,
  setShowRecurrenceEndDatePicker,
  showCategorySheet,
  showDatePicker,
  showFrequencySheet,
  showRecurrenceEndDatePicker,
  updateField,
}: AddSavingsGoalFormSectionsProps) => {
  const theme = useTheme();
  const {isDarkMode} = useTamaguiTheme();
  const themeColor = String(theme.color?.val ?? '');

  return (
    <>
      <YStack flex={1} padding="$4" gap="$4">
        {currentCategory.name === 'Retirement' ? (
          <GlassSurface padding="$3.5" borderRadius="$4">
            <YStack gap="$2">
              <HStack alignItems="center" gap="$2">
                <Ionicons name="flame" size={20} color="#F59E0B" />
                <Text variant="body1" color="#F59E0B" weight="bold">
                  Planning for Financial Independence (FIRE)?
                </Text>
              </HStack>
              <Text variant="caption" color="$textSecondary">
                Use our dedicated FIRE & Retirement planner for automatic 25x expense rule
                calculations, compound growth projections, and milestone tracking.
              </Text>
              <Button
                size="small"
                variant="primary"
                onPress={() => router.push('/retirement-planning')}
                marginTop="$1">
                Open FIRE & Retirement Planner
              </Button>
            </YStack>
          </GlassSurface>
        ) : null}

        <GoalInformationSection
          currentCategory={currentCategory}
          errors={errors}
          formData={formData}
          isDarkMode={isDarkMode}
          setShowCategorySheet={setShowCategorySheet}
          themeColor={themeColor}
          updateField={updateField}
        />
        <FinancialDetailsSection
          errors={errors}
          formData={formData}
          handleDeadlineChange={handleDeadlineChange}
          isDarkMode={isDarkMode}
          setShowDatePicker={setShowDatePicker}
          showDatePicker={showDatePicker}
          themeColor={themeColor}
          updateField={updateField}
        />
        {formData.targetAmount && parseFloat(formData.targetAmount) > 0 ? (
          <GoalProgressSection
            currentCategory={currentCategory}
            formData={formData}
            isDarkMode={isDarkMode}
          />
        ) : null}
        <RecurringSavingsSection
          formData={formData}
          handleRecurrenceEndDateChange={handleRecurrenceEndDateChange}
          handleRecurringChange={handleRecurringChange}
          isDarkMode={isDarkMode}
          setShowFrequencySheet={setShowFrequencySheet}
          setShowRecurrenceEndDatePicker={setShowRecurrenceEndDatePicker}
          showRecurrenceEndDatePicker={showRecurrenceEndDatePicker}
          themeColor={themeColor}
          updateField={updateField}
        />
      </YStack>

      <CategorySelectionSheet
        currentCategoryName={formData.category}
        isDarkMode={isDarkMode}
        onCategorySelect={handleCategorySelect}
        onOpenChange={setShowCategorySheet}
        open={showCategorySheet}
      />
      <FrequencySelectionSheet
        currentFrequency={formData.recurrenceFrequency}
        isDarkMode={isDarkMode}
        onFrequencySelect={handleFrequencySelect}
        onOpenChange={setShowFrequencySheet}
        open={showFrequencySheet}
      />
    </>
  );
};
