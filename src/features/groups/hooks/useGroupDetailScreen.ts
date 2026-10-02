import {useEffect, useState} from 'react';
import {useSharedValue} from 'react-native-reanimated';

import {useAuth, useCategory, useGroups, useSettings, useUser} from '@/context';
import {useScrollDirection} from '@/hooks/useProgressiveBlurHeader';
import {useAlert} from '@/hooks/useAlert';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {getInitials as getMemberInitials} from '@/utils/userUtils';
import {useGroupDetailModels} from './groupDetail/useGroupDetailModels';
import {useGroupDetailNavigation} from './groupDetail/useGroupDetailNavigation';
import {useGroupDetailActions} from './useGroupDetailActions';

import type {GroupTransactionFilter, UseGroupDetailScreenResult} from '../types/groupDetailScreen';

interface UseGroupDetailScreenOptions {
  groupId: string;
}

export const useGroupDetailScreen = ({
  groupId,
}: UseGroupDetailScreenOptions): UseGroupDetailScreenResult => {
  const {groups} = useGroups();
  const {user} = useAuth();
  const {profile} = useUser();
  const {categories} = useCategory();
  const {formatCurrency, currency, groupCurrency} = useSettings();
  const effectiveGroupCurrency = groupCurrency || currency || 'USD';
  const {isDarkMode} = useTamaguiTheme();
  const scrollY = useSharedValue(0);
  const {onScroll, isScrollingDown, resetScrollDirection} = useScrollDirection(scrollY);
  const {showAlert} = useAlert();

  const [isActionSheetOpen, setActionSheetOpen] = useState(false);
  const [isMembersSheetOpen, setMembersSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<GroupTransactionFilter>('all');
  const [nudging, setNudging] = useState<Record<string, boolean>>({});

  const group = groups.items.find((item) => item.id === groupId) ?? null;
  const {
    getUserDisplayName,
    stats,
    balanceViewModel,
    memberItems,
    filteredTopTransactions,
    subtitle,
    getTransactionItem,
  } = useGroupDetailModels({
    group,
    user,
    profile,
    categories,
    groupCurrency: effectiveGroupCurrency,
    formatCurrency,
    isDarkMode,
    transactionFilter,
  });
  const {
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
  } = useGroupDetailNavigation({group, setActionSheetOpen});

  const {handleDeleteGroup, handleNudgeSuggestion, handleInviteSuggestion} = useGroupDetailActions({
    group,
    showAlert,
    groups,
    isDeleting,
    userId: user?.uid,
    getUserDisplayName,
    setActionSheetOpen,
    setIsDeleting,
    setNudging,
  });

  useEffect(() => {
    if (!group && isDeleting) {
      const navigationTimer = setTimeout(() => {
        try {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/groups');
          setTimeout(() => setIsDeleting(false), 200);
        } catch {
          router.push('/(tabs)/groups');
          setIsDeleting(false);
        }
      }, 300);
      return () => clearTimeout(navigationTimer);
    }
    return undefined;
  }, [group, isDeleting, router]);

  return {
    group,
    isDeleting,
    isDeletedPlaceholder: !group && isDeleting,
    isActionSheetOpen,
    isMembersSheetOpen,
    transactionFilter,
    stats,
    memberItems,
    balanceViewModel,
    filteredTopTransactions,
    nudging,
    title: group ? (group.emoji ? `${group.emoji} ${group.name}` : group.name) : '',
    subtitle,
    isDarkMode,
    profilePictureUri: profile?.profilePictureUri ?? undefined,
    userId: user?.uid,
    currentUserDisplayName: getUserDisplayName(),
    formatCurrency,
    scrollY,
    onScroll,
    isScrollingDown,
    resetScrollDirection,
    setTransactionFilter,
    setActionSheetOpen,
    setMembersSheetOpen,
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
    handleDeleteGroup,
    handleNudgeSuggestion,
    handleInviteSuggestion,
    getInitials: getMemberInitials,
    getTransactionItem,
  };
};
