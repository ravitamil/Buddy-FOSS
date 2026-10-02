import {FloatingAction} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {AddSavingsGoalFormSections} from '@/features/savings/components/AddSavingsGoalFormSections';
import {useAddSavingsGoalScreen} from '@/features/savings/hooks/useAddSavingsGoalScreen';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';

const AddSavingsGoalScreen = () => {
  const screen = useAddSavingsGoalScreen();
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={screen.isEditing ? 'Edit Savings Goal' : 'Add Savings Goal'}
        subtitle={screen.isEditing ? 'Update your savings goal' : 'Plan for your financial future'}
        onBackPress={() => screen.router.back()}
        mode="collapsing"
        {...headerProps}
      />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{paddingBottom: 120, paddingTop: 118}}>
        <AddSavingsGoalFormSections
          currentCategory={screen.currentCategory}
          errors={screen.errors}
          formData={screen.formData}
          handleCategorySelect={screen.handleCategorySelect}
          handleDeadlineChange={screen.handleDeadlineChange}
          handleFrequencySelect={screen.handleFrequencySelect}
          handleRecurrenceEndDateChange={screen.handleRecurrenceEndDateChange}
          handleRecurringChange={screen.handleRecurringChange}
          setShowCategorySheet={screen.setShowCategorySheet}
          setShowDatePicker={screen.setShowDatePicker}
          setShowFrequencySheet={screen.setShowFrequencySheet}
          setShowRecurrenceEndDatePicker={screen.setShowRecurrenceEndDatePicker}
          showCategorySheet={screen.showCategorySheet}
          showDatePicker={screen.showDatePicker}
          showFrequencySheet={screen.showFrequencySheet}
          showRecurrenceEndDatePicker={screen.showRecurrenceEndDatePicker}
          updateField={screen.updateField}
        />
      </Animated.ScrollView>
      <FloatingAction
        presentation="save"
        onPress={() => {
          void screen.handleSave();
        }}
        loading={screen.loading}
        disabled={
          screen.loading || !screen.formData.name.trim() || !screen.formData.targetAmount.trim()
        }
        label={screen.isEditing ? 'Update Goal' : 'Create Goal'}
      />
    </ScreenContainer>
  );
};

export default AddSavingsGoalScreen;
