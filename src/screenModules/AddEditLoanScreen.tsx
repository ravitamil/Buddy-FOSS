import {FloatingAction} from '@ravitamil/buddy-ui';
import React from 'react';
import {YStack} from 'tamagui';
import {
  AddEditLoanSections,
  AddEditLoanSheets,
  useAddEditLoanScreen,
  type LoanFormProps,
} from '@/features/loans';
import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';

export const LoanForm = (props: LoanFormProps) => {
  const screen = useAddEditLoanScreen(props);
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardMode="aware-scroll"
        keyboardBottomOffset={100}
        onScroll={onScroll}
        bounces
        contentContainerStyle={{
          paddingTop: 100,
          paddingBottom: 160,
          flexGrow: 1,
        }}>
        <YStack padding="$4" gap="$3">
          <AddEditLoanSections screen={screen} />
        </YStack>
      </ScreenWrapper>

      <FloatingAction presentation="save" onPress={screen.handleSubmit} loading={screen.loading} />

      <CustomNavigationHeader
        title={screen.isEditing ? 'Edit Loan' : 'Add New Loan'}
        subtitle={screen.isEditing ? 'Update loan information' : 'Track and Manage your loans'}
        mode="collapsing"
        {...headerProps}
        onBackPress={screen.handleCancel}
      />

      <AddEditLoanSheets screen={screen} />
    </ScreenContainer>
  );
};

const AddEditLoanScreen = (props: LoanFormProps) => <LoanForm {...props} />;

export default AddEditLoanScreen;
