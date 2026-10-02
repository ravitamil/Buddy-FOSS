import {FloatingAction, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {YStack, styled} from 'tamagui';
import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  EditGroupTransactionDetailsSections,
  EditGroupTransactionEmptyState,
  EditGroupTransactionMemberSections,
  useEditGroupTransactionScreen,
} from '@/features/groups';

const UpdateHeaderButton = styled(YStack, {
  name: 'EditGroupTransactionUpdateHeaderButton',
  backgroundColor: '$warning5',
  paddingVertical: '$2',
  paddingHorizontal: '$4',
  borderRadius: '$6',
  alignItems: 'center',
  justifyContent: 'center',
  pressStyle: {
    opacity: 0.78,
    scale: 0.98,
  },
});

interface EditGroupTransactionScreenProps {
  groupId: string;
  transactionId: string;
}

const EditGroupTransactionScreen = ({groupId, transactionId}: EditGroupTransactionScreenProps) => {
  const screen = useEditGroupTransactionScreen({groupId, transactionId});

  if (!screen.group) {
    return (
      <EditGroupTransactionEmptyState
        icon="😕"
        title="Group not found"
        onBack={screen.handleBack}
      />
    );
  }

  if (!screen.existingTransaction) {
    return (
      <EditGroupTransactionEmptyState
        icon="📄"
        title="Transaction not found"
        onBack={screen.handleBack}
      />
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <GestureHandlerRootView style={{flex: 1}}>
        <ScreenWrapper
          edges={[]}
          backgroundColor="transparent"
          padding={false}
          keyboardMode="aware-scroll"
          onScroll={screen.onScroll}
          keyboardBottomOffset={120}
          contentContainerStyle={{paddingBottom: 120}}>
          <VStack flex={1} padding="$2" gap="$0">
            <CustomNavigationHeader
              title="Edit Transaction"
              largeTitle="Edit Transaction"
              {...screen.headerProps}
              onBackPress={screen.handleBack}
              rightElement={
                <UpdateHeaderButton
                  onPress={screen.handleSubmit}
                  disabled={!screen.isFormValid || screen.loading}
                  opacity={!screen.isFormValid || screen.loading ? 0.5 : 1}
                  accessibilityRole="button">
                  <Text color="white" weight="bold" variant="body2">
                    {screen.loading ? '...' : 'Update'}
                  </Text>
                </UpdateHeaderButton>
              }
            />

            <VStack flex={1} paddingHorizontal={20} gap="$4">
              <EditGroupTransactionDetailsSections screen={screen} />
              <EditGroupTransactionMemberSections screen={screen} />
            </VStack>
          </VStack>
        </ScreenWrapper>
        <FloatingAction
          presentation="save"
          onPress={screen.handleSubmit}
          loading={screen.loading}
          disabled={!screen.isFormValid}
          label="Update Transaction"
        />
      </GestureHandlerRootView>
    </ScreenContainer>
  );
};

export default EditGroupTransactionScreen;
