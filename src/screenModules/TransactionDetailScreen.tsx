import React from 'react';
import Animated from 'react-native-reanimated';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  DeleteTransactionModal,
  TransactionDetailNotFound,
  TransactionDetailSections,
  useTransactionDetailScreenModel,
} from '@/features/transactions';

interface TransactionDetailScreenProps {
  transactionId?: string;
}

const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({transactionId}) => {
  const model = useTransactionDetailScreenModel({transactionId});

  if (!model.transaction) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
        <CustomNavigationHeader title="Transaction Not Found" onBackPress={model.goBack} />
        <TransactionDetailNotFound isDarkMode={model.isDarkMode} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      <CustomNavigationHeader
        title="Transaction Details"
        onBackPress={model.goBack}
        largeTitle="Transaction Details"
        {...model.headerProps}
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 100}}
          scrollEventThrottle={16}
          onScroll={model.onScroll}>
          <TransactionDetailSections
            transaction={model.transaction}
            category={model.category}
            walletName={model.walletName}
            groupName={model.groupName}
            isLoanPayment={model.isLoanPayment}
            isSubscriptionPayment={model.isSubscriptionPayment}
            isGroupTransaction={model.isGroupTransaction}
            canEditAmount={model.canEditAmount}
            transactionIcon={model.transactionIcon}
            isDarkMode={model.isDarkMode}
            formatCurrency={model.formatCurrency}
            onEditTransaction={model.editTransaction}
            onNavigateToSource={model.navigateToSource}
            onDeleteTransaction={model.requestDeleteTransaction}
          />
        </Animated.ScrollView>
      </ScreenWrapper>

      <DeleteTransactionModal
        isVisible={model.showDeleteModal}
        onCancel={model.cancelDeleteTransaction}
        onConfirm={model.confirmDeleteTransaction}
      />
    </ScreenContainer>
  );
};

export default TransactionDetailScreen;
