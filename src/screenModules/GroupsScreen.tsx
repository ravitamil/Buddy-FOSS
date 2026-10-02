import {FloatingAction} from '@ravitamil/buddy-ui';
import React from 'react';

import {ScreenContainer, ScreenWrapper} from '@/components/ui';
import {GroupsScreenHeader} from '@/features/groups/components/GroupsScreenHeader';
import {GroupsScreenList} from '@/features/groups/components/GroupsScreenList';
import {GroupsScreenModals} from '@/features/groups/components/GroupsScreenModals';
import {useGroupsScreen} from '@/features/groups/hooks/useGroupsScreen';

const GroupsScreen = () => {
  const screen = useGroupsScreen();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea edges={['bottom']}>
      <GroupsScreenHeader
        groupCount={screen.allGroups.length}
        isSearchOpen={screen.isSearchOpen}
        onOpenSearch={screen.openSearch}
        onCloseSearch={screen.closeSearch}
        scrollY={screen.scrollY}
      />

      <ScreenWrapper
        scrollable={false}
        useSafeArea={false}
        backgroundColor="transparent"
        padding={false}>
        <GroupsScreenList
          groups={screen.filteredGroups}
          groupCount={screen.allGroups.length}
          loading={screen.loading}
          isDarkMode={screen.isDarkMode}
          searchQuery={screen.searchQuery}
          isSearchOpen={screen.isSearchOpen}
          overallStats={screen.overallStats}
          formatCurrency={screen.formatCurrency}
          onRefresh={screen.handleRefresh}
          onCreateGroup={screen.handleCreateGroup}
          onSearchChange={screen.setSearchQuery}
          onClearSearch={screen.clearSearch}
          onOpenGroup={screen.navigateGroup}
          onAddExpense={screen.navigateAddExpense}
          onOpenActions={screen.openGroupActions}
          getGroupCardModel={screen.getGroupCardModel}
          onScroll={screen.onScroll}
        />

        <GroupsScreenModals
          isDarkMode={screen.isDarkMode}
          selectedGroup={screen.selectedGroup}
          isDeleting={screen.isDeleting}
          isActionSheetOpen={screen.isActionSheetOpen}
          isDeleteModalOpen={screen.isDeleteModalOpen}
          onActionSheetOpenChange={(open) => {
            if (!open) screen.closeActionSheet();
          }}
          onDeleteModalClose={screen.closeDeleteModal}
          onInsights={screen.navigateInsights}
          onSettlementHistory={screen.navigateSettlementHistory}
          onEditGroup={screen.navigateEditGroup}
          onRequestDelete={screen.requestDeleteGroup}
          onConfirmDelete={() => {
            void screen.confirmDeleteGroup();
          }}
        />
      </ScreenWrapper>

      <FloatingAction
        presentation="circular"
        variant="info"
        label="Create group"
        bottomOffset={80}
        onPress={screen.handleCreateGroup}
        isScrollingDown={screen.isScrollingDown}
      />
    </ScreenContainer>
  );
};

export default GroupsScreen;
