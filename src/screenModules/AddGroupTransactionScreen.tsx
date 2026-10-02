import {FloatingAction, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {
  AddGroupTransactionCategorySheet,
  AddGroupTransactionDetailsSections,
  AddGroupTransactionEmptyState,
  AddGroupTransactionMemberSections,
  AddGroupTransactionReceiptSheet,
  useAddGroupTransactionScreen,
} from '@/features/groups';

interface AddGroupTransactionScreenProps {
  groupId: string;
  initialType?: string;
  initialPaidBy?: string;
  initialReceivedBy?: string;
  initialAmount?: string;
}

const AddGroupTransactionScreen = (props: AddGroupTransactionScreenProps) => {
  const screen = useAddGroupTransactionScreen(props);

  if (!screen.group) {
    return <AddGroupTransactionEmptyState onBack={screen.handleBack} />;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']} ignoreBottomSafeArea>
        <CustomNavigationHeader
          title="Add Transaction"
          largeTitle="Add Transaction"
          subtitle={screen.group.name}
          mode="collapsing"
          {...screen.headerProps}
          onBackPress={screen.handleBack}
        />

        <Animated.ScrollView
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{paddingTop: 118, paddingBottom: 120}}
          scrollEventThrottle={16}
          onScroll={screen.onScroll}>
          <VStack flex={1} paddingHorizontal={20} gap="$4">
            <AddGroupTransactionDetailsSections screen={screen} />
            <AddGroupTransactionMemberSections screen={screen} />
          </VStack>
        </Animated.ScrollView>

        <FloatingAction
          presentation="save"
          onPress={screen.handleSubmit}
          loading={screen.loading}
          disabled={!screen.isFormValid}
          label={screen.transactionType === 'expense' ? 'Add Expense' : 'Record Transfer'}
        />
        <AddGroupTransactionCategorySheet screen={screen} />
        <AddGroupTransactionReceiptSheet screen={screen} />
      </ScreenContainer>
    </GestureHandlerRootView>
  );
};

export default AddGroupTransactionScreen;
