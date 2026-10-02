import React, {useCallback} from 'react';
import type {FlashListProps, ListRenderItem} from '@shopify/flash-list';

import {VStack} from '@ravitamil/buddy-ui';
import StandardFlashList from '../components/ui/StandardFlashList';
import {useTamaguiTheme} from '../context/TamaguiThemeProvider';
import type {SubscriptionData} from '../types/finance.types';
import {SubscriptionsScreenListItem} from '@/features/subscriptions/components/SubscriptionsScreenListItem';
import {
  SubscriptionsEmptyState,
  SubscriptionsLoadingState,
} from '@/features/subscriptions/components/SubscriptionsScreenStates';
import {useSubscriptionsScreen} from '@/features/subscriptions/hooks/useSubscriptionsScreen';

type SubscriptionsScreenProps = {
  onScroll?: FlashListProps<SubscriptionData>['onScroll'];
};

const LIST_HORIZONTAL_PADDING = 16;
const LIST_BOTTOM_PADDING = 100;

const SubscriptionsScreen = ({onScroll}: SubscriptionsScreenProps) => {
  const {isDarkMode} = useTamaguiTheme();
  const screen = useSubscriptionsScreen();

  const renderSubscriptionItem = useCallback<ListRenderItem<SubscriptionData>>(
    ({item}) => (
      <SubscriptionsScreenListItem
        subscription={item}
        isDarkMode={isDarkMode}
        formatCurrency={screen.formatCurrency}
        onViewSubscription={screen.handleViewSubscription}
      />
    ),
    [isDarkMode, screen.formatCurrency, screen.handleViewSubscription],
  );

  if (screen.isLoading && !screen.hasSubscriptionsData) {
    return <SubscriptionsLoadingState />;
  }

  return (
    <VStack flex={1}>
      {screen.hasSubscriptionsData ? (
        <VStack
          flex={1}
          key={`subscriptions-list-${screen.subscriptions.length}-${screen.subscriptions[0]?.id || 'empty'}`}>
          <StandardFlashList<SubscriptionData>
            data={screen.subscriptions}
            renderItem={renderSubscriptionItem}
            keyExtractor={(item) => item.id}
            onRefresh={screen.handleRefreshPress}
            refreshing={screen.refreshing}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: LIST_BOTTOM_PADDING,
              paddingHorizontal: LIST_HORIZONTAL_PADDING,
            }}
          />
        </VStack>
      ) : (
        <VStack flex={1}>
          <SubscriptionsEmptyState onAddSubscription={screen.handleAddSubscription} />
        </VStack>
      )}
    </VStack>
  );
};

export default SubscriptionsScreen;
