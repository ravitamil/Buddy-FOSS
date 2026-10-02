import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {ScrollView} from 'tamagui';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {
  SavingsGoalDeleteDialog,
  SavingsGoalAddAmountDialog,
  SavingsGoalDetailsCard,
  SavingsGoalEditButton,
  SavingsGoalLoadingState,
  SavingsGoalQuickActionsCard,
  SavingsGoalRetirementAnalysis,
  SavingsGoalSummaryCard,
  useSavingsGoalDetailScreen,
} from '@/features/savings';

interface SavingsGoalDetailScreenProps {
  goalId: string;
  fromCreation?: boolean;
}

const SavingsGoalDetailScreen = ({goalId, fromCreation = false}: SavingsGoalDetailScreenProps) => {
  const screen = useSavingsGoalDetailScreen({goalId, fromCreation});

  if (!screen.goal || !screen.goalMetrics) {
    return (
      <SavingsGoalLoadingState
        availableGoals={screen.savingsGoalsCount}
        goalId={screen.goalId}
        headerProps={screen.headerProps}
        loadingTimeout={screen.loadingTimeout}
        onBack={screen.handleGoBack}
        onRetry={screen.handleRetry}
      />
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={screen.goal.name}
        subtitle="Savings Goal Details"
        onBackPress={screen.handleGoBack}
        mode="collapsing"
        {...screen.headerProps}
        rightElement={
          <SavingsGoalEditButton isDarkMode={screen.isDarkMode} onPress={screen.handleEditGoal} />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={screen.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: 118,
        }}>
        <VStack flex={1} padding="$4" gap="$4">
          <SavingsGoalSummaryCard
            amountLeft={screen.goalMetrics.amountLeft}
            daysToDeadline={screen.goalMetrics.daysToDeadline}
            formatCurrency={screen.formatCurrency}
            goal={screen.goal}
            goalColor={screen.goalMetrics.goalColor}
            goalIcon={screen.goalMetrics.goalIcon}
            isDarkMode={screen.isDarkMode}
            progressPercentage={screen.goalMetrics.progressPercentage}
          />
          <SavingsGoalQuickActionsCard
            isGoalCompleted={screen.goalMetrics.isGoalCompleted}
            onAddToCurrent={screen.handleAddToCurrent}
            onDeleteGoal={screen.handleDeleteGoal}
            onShowTips={screen.handleShowTips}
          />
          <SavingsGoalDetailsCard goal={screen.goal} isDarkMode={screen.isDarkMode} />
          <SavingsGoalRetirementAnalysis
            formatCurrency={screen.formatCurrency}
            goal={screen.goal}
          />
        </VStack>
      </ScrollView>

      {screen.showDeleteModal && (
        <SavingsGoalDeleteDialog
          goalName={screen.goal.name}
          isDarkMode={screen.isDarkMode}
          onCancel={screen.cancelDeleteGoal}
          onConfirm={() => {
            void screen.confirmDeleteGoal();
          }}
        />
      )}

      {screen.showAddAmountModal && (
        <SavingsGoalAddAmountDialog
          amount={screen.addAmount}
          isDarkMode={screen.isDarkMode}
          isSubmitting={screen.isAddingAmount}
          onAmountChange={screen.setAddAmount}
          onCancel={screen.cancelAddAmount}
          onConfirm={() => {
            void screen.confirmAddAmount();
          }}
        />
      )}
    </ScreenContainer>
  );
};

export default SavingsGoalDetailScreen;
