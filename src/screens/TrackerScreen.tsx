import {
  FloatingAction,
  LoadingIndicator,
  SegmentedControl,
  Text,
  VStack,
} from '@ravitamil/buddy-ui';
import {useRouter} from 'expo-router';
import React, {useCallback, useState} from 'react';

import {ScreenContainer} from '@/components/ui';
import {useLoan, useSubscription} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {BudgetTrackerView} from '@/features/budgets/components/BudgetTrackerView';
import {budgetRoutes} from '@/features/budgets';
import {useBudgetState} from '@/features/budgets/hooks/useBudgetState';
import LoansScreen from '@/screenModules/LoansScreen';
import SubscriptionsScreen from '@/screenModules/SubscriptionsScreen';
import {getFontFamilyForWeight} from '@/utils/fonts';

type ViewMode = 'budgets' | 'loans' | 'subscriptions';

const trackerOptions: Array<{label: string; value: ViewMode}> = [
  {label: 'Budgets', value: 'budgets'},
  {label: 'Loans', value: 'loans'},
  {label: 'Subs', value: 'subscriptions'},
];

const TrackerScreen = () => {
  const router = useRouter();
  const {isDarkMode} = useTamaguiTheme();
  const {isLoading: budgetsLoading} = useBudgetState();
  const {loans} = useLoan();
  const {isLoading: subscriptionsLoading} = useSubscription();
  const [viewMode, setViewMode] = useState<ViewMode>('budgets');

  const isLoading =
    (viewMode === 'budgets' && budgetsLoading) ||
    (viewMode === 'loans' && loans.isLoading) ||
    (viewMode === 'subscriptions' && subscriptionsLoading);

  const handleAddPress = useCallback(() => {
    if (viewMode === 'budgets') {
      router.push(budgetRoutes.create());
      return;
    }
    if (viewMode === 'loans') {
      router.push('/add-edit-loan');
      return;
    }
    router.push('/add-edit-subscription');
  }, [router, viewMode]);

  const actionLabel =
    viewMode === 'budgets' ? 'New plan' : viewMode === 'loans' ? 'Add loan' : 'Add subscription';

  return (
    <ScreenContainer
      dotSize={2}
      dotSpacing={18}
      edges={['top', 'bottom']}
      ignoreBottomSafeArea={false}>
      <VStack paddingHorizontal="$4" paddingTop="$4" gap="$4">
        <VStack>
          <Text
            fontSize={28}
            lineHeight={34}
            fontWeight="700"
            color="$text"
            letterSpacing={-0.5}
            paddingLeft={2}
            fontFamily={getFontFamilyForWeight('bold')}>
            Trackers
          </Text>
          <Text
            fontSize={11}
            lineHeight={14}
            fontWeight="600"
            color="$textSecondary"
            marginTop={6}
            paddingLeft={4}
            textTransform="uppercase"
            letterSpacing={0.5}
            fontFamily={getFontFamilyForWeight('semibold')}>
            Plans, loans, and subscriptions
          </Text>
        </VStack>

        <SegmentedControl
          options={trackerOptions}
          value={viewMode}
          onValueChange={(value) => {
            if (value === 'budgets' || value === 'loans' || value === 'subscriptions') {
              setViewMode(value);
            }
          }}
          selectedTone="info"
          testID="tracker-segmented-control"
        />
      </VStack>

      <VStack flex={1}>
        {isLoading ? (
          <VStack flex={1} justifyContent="center" alignItems="center" padding="$4">
            <LoadingIndicator
              size="large"
              color={isDarkMode ? '$purple5' : '$purple7'}
              accessibilityLabel="Loading tracker view"
            />
          </VStack>
        ) : (
          <>
            {viewMode === 'budgets' ? <BudgetTrackerView /> : null}
            {viewMode === 'loans' ? <LoansScreen /> : null}
            {viewMode === 'subscriptions' ? <SubscriptionsScreen /> : null}
          </>
        )}
      </VStack>

      <FloatingAction
        onPress={handleAddPress}
        presentation="circular"
        variant="info"
        label={actionLabel}
        bottomOffset={80}
      />
    </ScreenContainer>
  );
};

export default TrackerScreen;
