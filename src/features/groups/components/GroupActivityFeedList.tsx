import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React, {useCallback} from 'react';
import {Image} from 'expo-image';
import {RefreshControl, type ListRenderItem} from 'react-native';
import Animated from 'react-native-reanimated';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import {GroupEmptyState} from './GroupEmptyState';
import type {GroupActivityEvent} from '@/features/groups/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type EventConfig = {
  icon: IconName;
  color: string;
  label: string;
};

const EVENT_CONFIG: Record<GroupActivityEvent['eventType'], EventConfig> = {
  expense_added: {icon: 'add-circle', color: '#22c55e', label: 'Added expense'},
  expense_edited: {icon: 'pencil', color: '#f59e0b', label: 'Edited expense'},
  expense_deleted: {icon: 'trash', color: '#ef4444', label: 'Deleted expense'},
  settlement_recorded: {icon: 'checkmark-done-circle', color: '#3b82f6', label: 'Settled up'},
  member_added: {icon: 'person-add', color: '#8b5cf6', label: 'Member joined'},
  member_removed: {icon: 'person-remove', color: '#ec4899', label: 'Member removed'},
  member_invited: {icon: 'mail', color: '#06b6d4', label: 'Invited member'},
  group_created: {icon: 'people-circle', color: '#10b981', label: 'Group created'},
  group_updated: {icon: 'settings', color: '#64748b', label: 'Group updated'},
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const asNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const relativeTime = (date: Date): string => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
};

const buildDescription = (
  event: GroupActivityEvent,
  formatCurrency: (amount: number) => string,
): string => {
  const {metadata} = event;
  const description = asString(metadata.description);
  const amount = asNumber(metadata.amount);
  const memberName = asString(metadata.memberName);
  const memberNames = asString(metadata.memberNames);
  const email = asString(metadata.email);

  switch (event.eventType) {
    case 'expense_added':
      return `Added "${description ?? ''}"${amount === undefined ? '' : ` · ${formatCurrency(amount)}`}`;
    case 'expense_edited':
      return `Edited "${description ?? ''}"${amount === undefined ? '' : ` · ${formatCurrency(amount)}`}`;
    case 'expense_deleted':
      return `Deleted "${description || 'expense'}"`;
    case 'settlement_recorded':
      return amount === undefined ? 'Paid' : `Paid ${formatCurrency(amount)}`;
    case 'member_added':
      return `Added ${memberName || 'member'}`;
    case 'member_invited':
      return `Invited ${email || 'member'}`;
    case 'member_removed':
      return `Removed ${memberName || 'member'}`;
    case 'group_created':
      return memberNames ? `Created with ${memberNames}` : 'Group was created';
    case 'group_updated':
      return 'Group details updated';
    default:
      return '';
  }
};

interface ActivityRowProps {
  event: GroupActivityEvent;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
}

const ActivityRow: React.FC<ActivityRowProps> = ({event, isDarkMode, formatCurrency}) => {
  const cfg = EVENT_CONFIG[event.eventType] ?? EVENT_CONFIG.expense_added;
  const description = buildDescription(event, formatCurrency);
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: cardBg,
        borderRadius: 14,
        marginBottom: 8,
      }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
          overflow: 'hidden',
        }}>
        {event.actorAvatarUrl ? (
          <Image
            source={{uri: event.actorAvatarUrl}}
            contentFit="cover"
            style={{width: 42, height: 42, borderRadius: 21}}
          />
        ) : (
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: isDarkMode ? '#e2e8f0' : '#334155',
            }}>
            {(event.actorName ?? '?').charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <VStack flex={1} gap="$0.5">
        <HStack alignItems="center" gap="$1">
          <Text variant="body1" weight="semibold" numberOfLines={1} style={{flex: 1}}>
            {event.actorName ?? 'Someone'}
          </Text>
          <Text variant="caption" color="$textSecondary" style={{marginLeft: 4}}>
            {relativeTime(event.createdAt)}
          </Text>
        </HStack>
        <HStack alignItems="center" gap="$1">
          <Ionicons name={cfg.icon} size={13} color={cfg.color} />
          <Text variant="caption" color="$textSecondary" numberOfLines={2}>
            {cfg.label}
            {description ? ` · ${description}` : ''}
          </Text>
        </HStack>
      </VStack>
    </View>
  );
};

interface GroupActivityFeedListProps {
  events: GroupActivityEvent[];
  loading: boolean;
  refreshing: boolean;
  isDarkMode: boolean;
  bottomInset: number;
  formatCurrency: (amount: number) => string;
  onScroll: React.ComponentProps<typeof Animated.FlatList>['onScroll'];
  onRefresh: () => void;
}

export const GroupActivityFeedList: React.FC<GroupActivityFeedListProps> = ({
  events,
  loading,
  refreshing,
  isDarkMode,
  bottomInset,
  formatCurrency,
  onScroll,
  onRefresh,
}) => {
  const renderEmpty = useCallback(
    () => (
      <View style={{padding: 32}}>
        <GroupEmptyState
          iconName="time-outline"
          title="No Activity Yet"
          subtitle="Activity will appear here as group members add expenses and record settlements."
        />
      </View>
    ),
    [],
  );

  const renderItem = useCallback<ListRenderItem<GroupActivityEvent>>(
    ({item}) => (
      <ActivityRow event={item} isDarkMode={isDarkMode} formatCurrency={formatCurrency} />
    ),
    [formatCurrency, isDarkMode],
  );

  if (loading) {
    return (
      <VStack flex={1} alignItems="center" justifyContent="center">
        <Ionicons
          name="time-outline"
          size={40}
          color={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
        />
        <Text variant="body2" color="$textSecondary" marginTop="$2">
          Loading activity…
        </Text>
      </VStack>
    );
  }

  return (
    <Animated.FlatList
      data={events}
      keyExtractor={(item) => item.id}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingTop: 80,
        paddingHorizontal: 16,
        paddingBottom: bottomInset + 24,
        flexGrow: 1,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={renderEmpty}
      renderItem={renderItem}
    />
  );
};
