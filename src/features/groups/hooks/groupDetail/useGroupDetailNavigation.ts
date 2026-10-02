import {useCallback} from 'react';
import {useRouter} from 'expo-router';

import {appRoutes} from '@/navigation/routes';
import type {SettlementSuggestion} from '@/types';
import type {EnhancedGroup} from '@/features/groups/types';
import {requestContactsPermissionWithRationale} from '@/utils/permissions';

export const useGroupDetailNavigation = ({
  group,
  setActionSheetOpen,
}: {
  group: EnhancedGroup | null;
  setActionSheetOpen: (open: boolean) => void;
}) => {
  const router = useRouter();

  const closeActionSheetAndNavigate = useCallback(
    (path: Parameters<typeof router.push>[0]) => {
      setActionSheetOpen(false);
      setTimeout(() => {
        try {
          router.push(path);
        } catch {
          // fallback
        }
      }, 100);
    },
    [router, setActionSheetOpen],
  );

  const navigateBack = useCallback(() => router.back(), [router]);
  const navigateAddMember = useCallback(() => {
    if (group) {
      void requestContactsPermissionWithRationale().catch(() => undefined);
      router.push(appRoutes.groupEdit(group.id));
    }
  }, [group, router]);
  const navigateAddTransaction = useCallback(() => {
    if (group) router.push(appRoutes.groupAddTransaction(group.id));
  }, [group, router]);
  const navigateInsights = useCallback(() => {
    if (group) closeActionSheetAndNavigate(appRoutes.groupInsights(group.id));
  }, [closeActionSheetAndNavigate, group]);
  const navigateActivity = useCallback(() => {
    if (group) closeActionSheetAndNavigate(appRoutes.groupActivity(group.id));
  }, [closeActionSheetAndNavigate, group]);
  const navigateSettlementHistory = useCallback(() => {
    if (group) closeActionSheetAndNavigate(appRoutes.groupSettlementHistory(group.id));
  }, [closeActionSheetAndNavigate, group]);
  const navigateAllTransactions = useCallback(() => {
    if (group) router.push(appRoutes.groupAllTransactions(group.id));
  }, [group, router]);
  const navigateTransaction = useCallback(
    (transactionId: string) => {
      if (group) router.push(appRoutes.groupTransactionDetail(group.id, transactionId));
    },
    [group, router],
  );
  const navigateEditGroup = useCallback(() => {
    if (group) closeActionSheetAndNavigate(appRoutes.groupEdit(group.id));
  }, [closeActionSheetAndNavigate, group]);
  const navigateSettleSuggestion = useCallback(
    (suggestion: SettlementSuggestion) => {
      if (!group) return;
      router.push(
        appRoutes.groupAddTransaction(group.id, {
          initialType: 'payment',
          initialPaidBy: suggestion.fromMemberId,
          initialReceivedBy: suggestion.toMemberId,
          initialAmount: String(suggestion.amount),
        }),
      );
    },
    [group, router],
  );

  return {
    router,
    navigateBack,
    navigateAddMember,
    navigateAddTransaction,
    navigateInsights,
    navigateActivity,
    navigateSettlementHistory,
    navigateAllTransactions,
    navigateTransaction,
    navigateEditGroup,
    navigateSettleSuggestion,
  };
};
