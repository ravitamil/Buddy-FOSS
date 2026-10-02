import React from 'react';
import {Stack} from 'expo-router';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {GroupActivityFeedList} from '@/features/groups/components/GroupActivityFeedList';
import {useGroupActivityFeedScreen} from '@/features/groups/hooks/useGroupActivityFeedScreen';

interface GroupActivityFeedScreenProps {
  groupId: string;
}

const GroupActivityFeedScreen: React.FC<GroupActivityFeedScreenProps> = ({groupId}) => {
  const screen = useGroupActivityFeedScreen({groupId});

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <Stack.Screen options={{headerShown: false}} />
      <CustomNavigationHeader
        title="Group Activity"
        subtitle={screen.group?.name}
        largeTitle="Group Activity"
        mode="collapsing"
        {...screen.headerProps}
        onBackPress={screen.navigateBack}
      />
      <GroupActivityFeedList
        events={screen.events}
        loading={screen.loading}
        refreshing={screen.refreshing}
        isDarkMode={screen.isDarkMode}
        bottomInset={screen.bottomInset}
        formatCurrency={screen.formatCurrency}
        onScroll={screen.onScroll}
        onRefresh={screen.onRefresh}
      />
    </ScreenContainer>
  );
};

export default GroupActivityFeedScreen;
