import {Button, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useTheme} from 'tamagui';
import {CustomNavigationHeader} from '@/components/ui/CustomNavigationHeader';
import ScreenContainer from '@/components/ui/ScreenContainer';
import {LoanAdditionalPaymentModal} from '@/features/loans/components/loanDetail/LoanAdditionalPaymentModal';
import {LoanDeleteConfirmationModal} from '@/features/loans/components/loanDetail/LoanDeleteConfirmationModal';
import {LoanDetailSections} from '@/features/loans/components/LoanDetailSections';
import {LoanInstallmentDetailModal} from '@/features/loans/components/loanDetail/LoanInstallmentDetailModal';
import {useLoanDetailScreen} from '@/features/loans/hooks/useLoanDetailScreen';

const tokenColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

interface LoanDetailScreenProps {
  loanId: string;
}

const LoanDetailScreen = ({loanId}: LoanDetailScreenProps) => {
  const theme = useTheme();
  const blue = tokenColor(theme.blue9?.val, '#3B82F6');
  const screen = useLoanDetailScreen({loanId});

  if (!screen.loan || !screen.metrics) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
        <VStack flex={1} padding="$4" gap="$4">
          <CustomNavigationHeader
            title="Loan Details"
            subtitle={screen.loadingTimeout ? 'Failed to load loan' : 'Loading loan information'}
            mode="collapsing"
            {...screen.headerProps}
            onBackPress={screen.handleGoBack}
          />

          <VStack flex={1} justifyContent="center" alignItems="center" gap="$4">
            {screen.loadingTimeout ? (
              <>
                <Text color="$red5" textAlign="center">
                  Unable to load loan details.
                </Text>
                <Text color="$gray10" textAlign="center" fontSize="$3">
                  Loan ID: {screen.loanId}
                </Text>
                <Text color="$gray10" textAlign="center" fontSize="$3">
                  Available loans: {screen.availableLoanCount}
                </Text>
                <Button onPress={screen.handleRetry} theme="blue">
                  Retry
                </Button>
                <Button onPress={screen.handleGoBack} theme="gray">
                  Go Back
                </Button>
              </>
            ) : (
              <>
                <Text>Loading loan details...</Text>
                <Text color="$gray10" fontSize="$3">
                  Loan ID: {screen.loanId}
                </Text>
              </>
            )}
          </VStack>
        </VStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={screen.loan.name}
        subtitle="Loan Details"
        mode="collapsing"
        {...screen.headerProps}
        onBackPress={screen.handleGoBack}
        rightElement={
          <Button
            variant="ghost"
            onPress={screen.handleEditLoan}
            width={44}
            height={44}
            borderRadius={22}
            paddingHorizontal={0}
            backgroundColor="$blue3">
            <Ionicons name="create-outline" size={20} color={blue} />
          </Button>
        }
      />

      <Animated.ScrollView
        onScroll={screen.onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 118, paddingBottom: 20}}>
        <VStack flex={1} padding="$4" gap="$4">
          <LoanDetailSections
            loan={screen.loan}
            metrics={screen.metrics}
            formatCurrency={screen.formatCurrency}
            formatDate={screen.formatDate}
            buttonText={screen.buttonText}
            hasMarkedPaid={screen.hasMarkedPaid}
            showPaymentHistory={screen.showPaymentHistory}
            onRecordPayment={() => {
              screen.handleRecordPayment();
            }}
            onPrepayment={screen.showPrepaymentComingSoon}
            onDeleteLoan={screen.handleDeleteLoan}
            onTogglePaymentHistory={screen.setShowPaymentHistory}
            onInstallmentPress={screen.handleInstallmentPress}
          />
        </VStack>
      </Animated.ScrollView>

      <LoanDeleteConfirmationModal
        visible={screen.showDeleteModal}
        loanName={screen.loan.name}
        onCancel={screen.cancelDeleteLoan}
        onConfirm={() => {
          void screen.confirmDeleteLoan();
        }}
      />
      <LoanInstallmentDetailModal
        visible={screen.showInstallmentModal}
        installment={screen.selectedInstallment}
        formatCurrency={screen.formatCurrency}
        onClose={screen.closeInstallmentModal}
        onRecordPayment={() => {
          screen.closeInstallmentModal();
          screen.handleRecordPayment();
        }}
      />
      <LoanAdditionalPaymentModal
        state={screen.additionalPayment}
        onAmountChange={screen.setAdditionalPaymentAmount}
        onCancel={screen.closeAdditionalPaymentModal}
        onSubmit={() => {
          void screen.submitAdditionalPayment();
        }}
      />
    </ScreenContainer>
  );
};

export default LoanDetailScreen;
