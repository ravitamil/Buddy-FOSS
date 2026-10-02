import {Skeleton} from '@ravitamil/buddy-ui';
import React, {useState, useCallback, useEffect} from 'react';
import {useRouter, useFocusEffect} from 'expo-router';
import type {FlashListProps} from '@shopify/flash-list';

import {VStack} from '@ravitamil/buddy-ui';
import {useTamaguiTheme} from '../context/TamaguiThemeProvider';
import {useLoan, useSettings} from '../context';
import type {EnhancedLoan} from '../context/LoanContext.query';
import {logger as appLogger} from '../services/LoggerService';
import StandardFlashList from '../components/ui/StandardFlashList';
import {LoansScreenEmptyState} from '@/features/loans/components/LoansScreenEmptyState';
import {LoansScreenListItem} from '@/features/loans/components/LoansScreenListItem';

type LoansScreenProps = {
  onScroll?: FlashListProps<EnhancedLoan>['onScroll'];
};

const LIST_HORIZONTAL_PADDING = 16;
const LIST_BOTTOM_PADDING = 100;

const LoansScreen = ({onScroll}: LoansScreenProps) => {
  const router = useRouter();
  const {isDarkMode} = useTamaguiTheme();
  const {loans, refreshLoans, isLoading} = useLoan();
  const {formatCurrency} = useSettings();

  useEffect(() => {
    appLogger.debug('LoansScreen: Loans data from context', {
      count: loans.items.length,
      isLoading,
    });
  }, [loans.items.length, isLoading]);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      appLogger.debug('LoansScreen: Screen focused, reloading data');
      void refreshLoans();
    }, [refreshLoans]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLoans();
    setRefreshing(false);
  }, [refreshLoans]);

  const handleViewLoan = useCallback(
    (loanId: string) => {
      appLogger.debug('LoansScreen: Navigating to loan details', {loanId});
      router.push(`/loan-detail/${loanId}`);
    },
    [router],
  );

  const handleQuickLoanAction = useCallback(
    (loanId: string, action: 'pay' | 'view'): void => {
      if (action === 'pay') {
        appLogger.debug('LoansScreen: Quick EMI payment initiated', {loanId});
        router.push(`/loan-detail/${loanId}?action=pay`);
      } else {
        handleViewLoan(loanId);
      }
    },
    [router, handleViewLoan],
  );

  const handleAddLoan = useCallback(() => {
    appLogger.debug('LoansScreen: Navigating to add loan');
    router.push('/add-edit-loan');
  }, [router]);

  const renderLoanItem = useCallback(
    ({item}: {item: EnhancedLoan}) => {
      return (
        <LoansScreenListItem
          loan={item}
          isDarkMode={isDarkMode}
          formatCurrency={formatCurrency}
          handleViewLoan={handleViewLoan}
          handleQuickLoanAction={handleQuickLoanAction}
        />
      );
    },
    [isDarkMode, formatCurrency, handleViewLoan, handleQuickLoanAction],
  );

  const hasLoansData = loans.items.length > 0;

  if (isLoading && !hasLoansData) {
    return (
      <VStack flex={1} padding="$4" gap="$4">
        <Skeleton width="100%" height={200} />
        <Skeleton width="100%" height={200} />
        <Skeleton width="100%" height={200} />
      </VStack>
    );
  }

  return (
    <VStack flex={1}>
      {hasLoansData ? (
        <StandardFlashList
          data={loans.items}
          renderItem={renderLoanItem}
          keyExtractor={(item) => item.id}
          onRefresh={() => {
            void handleRefresh();
          }}
          refreshing={refreshing}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: LIST_HORIZONTAL_PADDING,
            paddingBottom: LIST_BOTTOM_PADDING,
            paddingTop: 16,
          }}
        />
      ) : (
        <VStack flex={1}>
          <LoansScreenEmptyState onAddLoan={handleAddLoan} />
        </VStack>
      )}
    </VStack>
  );
};

export default LoansScreen;
