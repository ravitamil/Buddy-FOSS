import {FloatingAction} from '@ravitamil/buddy-ui';
import React from 'react';
import {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {useSettings} from '@/context';
import {getCurrencySymbol} from '@/constants/currencies';
import {CreateRetirementPlanFormSections} from '@/features/savings/components/CreateRetirementPlanFormSections';
import {useCreateRetirementPlanScreen} from '@/features/savings/hooks/useCreateRetirementPlanScreen';

const CreateRetirementPlanScreen = () => {
  const {formatCurrency, currency} = useSettings();
  const currencySymbol = getCurrencySymbol(currency);
  const {
    errors,
    fireMilestones,
    fireNumber,
    formData,
    goal,
    handleDeleteRetirementGoal,
    handleSubmit,
    router,
    setShowRiskProfileSheet,
    showRiskProfileSheet,
    updateField,
  } = useCreateRetirementPlanScreen();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={goal ? 'FIRE & Retirement Plan' : 'Plan for FIRE & Retirement'}
        subtitle={
          goal ? 'Manage financial independence goals' : 'Financial Independence, Retire Early'
        }
        onBackPress={() => router.back()}
        mode="collapsing"
        scrollY={scrollY}
        enableProgressiveBlur
      />
      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardMode="aware-scroll"
        onScroll={onScroll}
        keyboardBottomOffset={100}
        contentContainerStyle={{flexGrow: 1, paddingTop: 118, paddingBottom: 100}}>
        <CreateRetirementPlanFormSections
          currencySymbol={currencySymbol}
          errors={errors}
          fireMilestones={fireMilestones}
          fireNumber={fireNumber}
          formData={formData}
          formatCurrency={formatCurrency}
          goal={goal}
          handleDeleteRetirementGoal={handleDeleteRetirementGoal}
          setShowRiskProfileSheet={setShowRiskProfileSheet}
          showRiskProfileSheet={showRiskProfileSheet}
          updateField={updateField}
        />
      </ScreenWrapper>

      <FloatingAction
        presentation="save"
        onPress={handleSubmit}
        label={goal ? 'Save Plan' : 'Create Plan'}
      />
    </ScreenContainer>
  );
};

export default CreateRetirementPlanScreen;
