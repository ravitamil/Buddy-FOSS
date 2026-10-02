import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useGroups} from '@/context';
import {useSettings} from '@/context/SettingsContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {GroupActivityService} from '@/services/GroupActivityService';
import type {Transaction} from '@/types';
import type {GroupActivityEvent} from '@/features/groups/types';

const getActivityTransactionId = (event: GroupActivityEvent): string | undefined => {
  const transactionId = event.metadata.transactionId;
  return typeof transactionId === 'string' ? transactionId : undefined;
};

const synthesizeTransactionActivity = (
  transaction: Transaction,
  group: ReturnType<typeof useGroups>['groups']['items'][number],
): GroupActivityEvent => {
  const memberInfo = group.members.find((member) => member.id === transaction.paidBy);

  return {
    id: `synth_${transaction.id}`,
    groupId: group.id,
    actorUserId: memberInfo?.supabaseUserId,
    actorName: memberInfo?.name || 'Unknown',
    actorAvatarUrl: memberInfo?.avatar,
    eventType: transaction.isSettlement ? 'settlement_recorded' : 'expense_added',
    metadata: {
      transactionId: transaction.id,
      description: transaction.description,
      amount: Math.abs(transaction.amount || 0),
    },
    createdAt: transaction.date ? new Date(transaction.date) : new Date(),
  };
};

interface GroupActivityFeedScreenOptions {
  groupId: string;
}

export const useGroupActivityFeedScreen = ({groupId}: GroupActivityFeedScreenOptions) => {
  const router = useRouter();
  const {groups} = useGroups();
  const {formatCurrency} = useSettings();
  const {isDarkMode} = useTamaguiTheme();
  const {onScroll, headerProps} = useProgressiveBlurHeader();
  const insets = useSafeAreaInsets();

  const group = groups.items.find((item) => item.id === groupId) ?? null;
  const [events, setEvents] = useState<GroupActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivity = useCallback(async () => {
    if (!groupId || !group) return;

    try {
      const data = await GroupActivityService.getGroupActivity(groupId, 100);
      const activityTransactionIds = new Set(
        data
          .filter(
            (event) =>
              event.eventType === 'expense_added' ||
              event.eventType === 'expense_edited' ||
              event.eventType === 'settlement_recorded',
          )
          .map(getActivityTransactionId)
          .filter((transactionId): transactionId is string => Boolean(transactionId)),
      );

      const synthesizedActivities = group.transactions
        .filter((transaction) => !activityTransactionIds.has(transaction.id))
        .map((transaction) => synthesizeTransactionActivity(transaction, group));

      setEvents(
        [...data, ...synthesizedActivities].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [group, groupId]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadActivity();
  }, [loadActivity]);

  const navigateBack = useCallback(() => router.back(), [router]);

  return {
    group,
    events,
    loading,
    refreshing,
    isDarkMode,
    bottomInset: insets.bottom,
    formatCurrency,
    headerProps,
    onScroll,
    onRefresh,
    navigateBack,
  };
};
