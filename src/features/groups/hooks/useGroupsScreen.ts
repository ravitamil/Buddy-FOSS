import {Keyboard} from 'react-native';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRouter} from 'expo-router';

import {useAuth, useGroups, useSettings, useUser} from '@/context';
import {useMembership} from '@/context/MembershipContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import type {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import {findCurrentUserMember} from '@/utils/userUtils';
import {
  buildGroupCardModel,
  filterGroups,
  getGroupBalance as calculateGroupBalanceForMember,
  getOverallGroupStats,
  toGroupMember,
} from './groupScreenModels';

export interface GroupsScreenOverallStats {
  youOwe: number;
  owedToYou: number;
}

export interface GroupsScreenCardModel {
  id: string;
  name: string;
  members: number;
  yourShare: number;
  totalAmount: number;
  color: string;
  emoji?: string;
  lastActivityDate: Date;
  currency: string;
  currencySymbol: string;
}

export const useGroupsScreen = () => {
  appLogger.debug('GroupsScreen: component rendering started');

  const router = useRouter();
  const {groups, isLoading: isGroupsLoading, syncWithRemote} = useGroups();
  const {user} = useAuth();
  const {profile} = useUser();
  const {isPro} = useMembership();
  const {formatCurrency} = useSettings();
  const {showAlert} = useAlert();
  const {isDarkMode} = useTamaguiTheme();
  const {onScroll, isScrollingDown, scrollY} = useProgressiveBlurHeader();
  const [isActionSheetOpen, setActionSheetOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<EnhancedGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const lastManualRefreshTime = useRef(0);

  useEffect(() => {
    appLogger.debug('GroupsScreen: component mounted');
    return () => {
      appLogger.debug('GroupsScreen: component unmounting');
    };
  }, []);

  const filteredGroups = useMemo(
    () => filterGroups(groups.items, searchQuery),
    [groups.items, searchQuery],
  );

  const getUserDisplayName = useCallback(() => {
    return profile?.displayName || profile?.firstName || user?.displayName || 'User';
  }, [profile?.displayName, profile?.firstName, user?.displayName]);

  const getCurrentUserMember = useCallback(
    (members: EnhancedGroupMember[]) => {
      const userFirstName = profile?.firstName || user?.displayName?.split(' ')[0] || 'User';
      return findCurrentUserMember(
        members.map(toGroupMember),
        userFirstName,
        profile?.displayName,
        getUserDisplayName,
      );
    },
    [getUserDisplayName, profile?.displayName, profile?.firstName, user?.displayName],
  );

  const getGroupBalance = useCallback(
    (group: EnhancedGroup) => {
      const currentUserMember = getCurrentUserMember(group.members || []);
      if (!currentUserMember) return 0;

      return calculateGroupBalanceForMember(group, currentUserMember);
    },
    [getCurrentUserMember],
  );

  const getGroupCardModel = useCallback(
    (group: EnhancedGroup): GroupsScreenCardModel => {
      return buildGroupCardModel(group, getGroupBalance(group));
    },
    [getGroupBalance],
  );

  const overallStats = useMemo<GroupsScreenOverallStats>(
    () => getOverallGroupStats(groups.items, getGroupBalance),
    [getGroupBalance, groups.items],
  );

  const handleRefresh = useCallback(() => {
    appLogger.debug('GroupsScreen: refreshing groups');
    const now = Date.now();
    if (now - lastManualRefreshTime.current > 1000) {
      lastManualRefreshTime.current = now;
      void syncWithRemote();
    }
  }, [syncWithRemote]);

  const handleCreateGroup = useCallback(() => {
    if (!isPro && groups.items.length >= 1) {
      showAlert({
        title: 'Limit Reached',
        message: 'Free tier is limited to 1 group. Upgrade to Pro for unlimited groups.',
        actions: [
          {text: 'Cancel', style: 'cancel', onPress: () => {}},
          {text: 'Upgrade', onPress: () => void router.push('/paywall')},
        ],
      });
      return;
    }
    void router.push('/add-group');
  }, [groups.items.length, isPro, router, showAlert]);

  const openGroupActions = useCallback((group: EnhancedGroup) => {
    setSelectedGroup(group);
    setActionSheetOpen(true);
  }, []);

  const closeActionSheet = useCallback(() => setActionSheetOpen(false), []);
  const closeDeleteModal = useCallback(() => setDeleteModalOpen(false), []);
  const clearSearch = useCallback(() => setSearchQuery(''), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => {
    Keyboard.dismiss();
    setSearchQuery('');
    setIsSearchOpen(false);
  }, []);
  const navigateGroup = useCallback(
    (groupId: string) => void router.push(`/groups/${groupId}`),
    [router],
  );
  const navigateAddExpense = useCallback(
    (groupId: string) => void router.push(`/groups/${groupId}/add-transaction`),
    [router],
  );

  const closeSheetAndNavigate = useCallback(
    (path: Parameters<typeof router.push>[0]) => {
      setActionSheetOpen(false);
      setTimeout(() => void router.push(path), 300);
    },
    [router],
  );

  const navigateInsights = useCallback(() => {
    if (selectedGroup) closeSheetAndNavigate(`/group-insights/${selectedGroup.id}`);
  }, [closeSheetAndNavigate, selectedGroup]);

  const navigateSettlementHistory = useCallback(() => {
    if (selectedGroup) closeSheetAndNavigate(`/groups/${selectedGroup.id}/settlement-history`);
  }, [closeSheetAndNavigate, selectedGroup]);

  const navigateEditGroup = useCallback(() => {
    if (selectedGroup) closeSheetAndNavigate(`/edit-group?groupId=${selectedGroup.id}`);
  }, [closeSheetAndNavigate, selectedGroup]);

  const requestDeleteGroup = useCallback(() => {
    appLogger.debug('GroupsScreen: delete requested for:', selectedGroup?.id);
    setActionSheetOpen(false);
    setTimeout(() => setDeleteModalOpen(true), 100);
  }, [selectedGroup?.id]);

  const confirmDeleteGroup = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      appLogger.debug('GroupsScreen: deleting group:', selectedGroup.id);
      setDeleteModalOpen(false);
      setIsDeleting(true);

      await groups.delete(selectedGroup.id);
      appLogger.debug('GroupsScreen: group deleted successfully');

      setSelectedGroup(null);
      setIsDeleting(false);
      showAlert({title: 'Success', message: 'Group deleted successfully'});
    } catch (error) {
      setIsDeleting(false);
      appLogger.error('GroupsScreen: error deleting group:', error);
      showAlert({title: 'Error', message: 'Failed to delete group. Please try again.'});
    }
  }, [groups, selectedGroup, showAlert]);

  appLogger.debug('GroupsScreen: found', groups.items.length, 'groups');

  return {
    allGroups: groups.items,
    filteredGroups,
    loading: isGroupsLoading,
    searchQuery,
    isSearchOpen,
    selectedGroup,
    isActionSheetOpen,
    isDeleteModalOpen,
    isDeleting,
    isDarkMode,
    formatCurrency,
    overallStats,
    onScroll,
    isScrollingDown,
    scrollY,
    setSearchQuery,
    getGroupCardModel,
    handleCreateGroup,
    handleRefresh,
    openGroupActions,
    closeActionSheet,
    closeDeleteModal,
    navigateGroup,
    navigateAddExpense,
    navigateInsights,
    navigateSettlementHistory,
    navigateEditGroup,
    requestDeleteGroup,
    confirmDeleteGroup,
    clearSearch,
    openSearch,
    closeSearch,
  };
};
