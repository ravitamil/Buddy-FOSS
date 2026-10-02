import {Input, Text} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {XStack, YStack} from 'tamagui';

import type {SavingsCategoryOption} from '@/features/savings/hooks/useAddSavingsGoalScreen';
import {FieldError, FieldLabel, PickerButton, SectionHeader} from './SavingsGoalFormPrimitives';
import type {AddSavingsGoalFormSectionsProps, SavingsGoalIoniconName} from './types';

interface GoalInformationSectionProps extends Pick<
  AddSavingsGoalFormSectionsProps,
  'currentCategory' | 'errors' | 'formData' | 'setShowCategorySheet' | 'updateField'
> {
  isDarkMode: boolean;
  themeColor: string;
}

export const GoalInformationSection = ({
  currentCategory,
  errors,
  formData,
  isDarkMode,
  setShowCategorySheet,
  themeColor,
  updateField,
}: GoalInformationSectionProps) => (
  <GlassSurface>
    <YStack gap="$3">
      <SectionHeader
        icon={currentCategory.icons[0]}
        color={currentCategory.color}
        title="Goal Information"
        description="Basic details about your savings goal"
      />
      <YStack gap="$4" marginTop="$3">
        <FieldError label="Goal Name *" error={errors.name}>
          <Input
            placeholder="e.g., Emergency Fund"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            error={errors.name}
          />
        </FieldError>
        <CategoryPicker
          currentCategory={currentCategory}
          categoryName={formData.category}
          isDarkMode={isDarkMode}
          onOpen={() => setShowCategorySheet(true)}
          themeColor={themeColor}
        />
        <YStack gap="$2">
          <FieldLabel>Description</FieldLabel>
          <Input
            placeholder="Brief description of this goal..."
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            multiline
            minHeight={80}
            verticalAlign="top"
          />
        </YStack>
      </YStack>
    </YStack>
  </GlassSurface>
);

const CategoryPicker = ({
  categoryName,
  currentCategory,
  isDarkMode,
  onOpen,
  themeColor,
}: {
  categoryName: string;
  currentCategory: SavingsCategoryOption;
  isDarkMode: boolean;
  onOpen: () => void;
  themeColor: string;
}) => (
  <YStack gap="$2">
    <FieldLabel>Category</FieldLabel>
    <PickerButton onPress={onOpen} isDarkMode={isDarkMode}>
      <XStack justifyContent="space-between" alignItems="center" flex={1}>
        <XStack alignItems="center" gap="$2">
          <Ionicons
            name={currentCategory.icons[0] as SavingsGoalIoniconName}
            size={20}
            color={currentCategory.color}
          />
          <Text variant="body1" color="$color">
            {categoryName}
          </Text>
        </XStack>
        <Ionicons name="chevron-down" size={20} color={themeColor} />
      </XStack>
    </PickerButton>
  </YStack>
);
