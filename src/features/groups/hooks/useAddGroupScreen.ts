import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {useGroups, useUser} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useSettings} from '@/context/SettingsContext';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import type {SharedValue} from 'react-native-reanimated';
import type {EnhancedGroup, ProfileSearchResult} from '@/features/groups/types';

import {type GroupMemberDraft, useGroupMemberEditor} from './useGroupMemberEditor';

export type AddGroupMemberEntry = GroupMemberDraft;

export interface UseAddGroupScreenResult {
  groupName: string;
  groupDescription: string;
  groupEmoji: string;
  members: AddGroupMemberEntry[];
  searchQuery: string;
  isSearching: boolean;
  searchResults: ProfileSearchResult[];
  isDarkMode: boolean;
  isDescriptionExpanded: boolean;
  loading: boolean;
  selectedCurrency: string;
  showEmojiPicker: boolean;
  isCreateDisabled: boolean;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  isScrollingDown: SharedValue<boolean>;
  scrollY: SharedValue<number>;
  navigateBack: () => void;
  navigateToCurrencyPicker: () => void;
  setGroupName: (value: string) => void;
  setGroupDescription: (value: string) => void;
  setSearchQuery: (value: string) => void;
  clearSearchResults: () => void;
  applyTemplate: (template: {name: string; emoji: string}) => void;
  openEmojiPicker: () => void;
  closeEmojiPicker: () => void;
  selectEmoji: (emoji: string) => void;
  toggleDescriptionExpand: () => void;
  handleAddFoundUser: (user: ProfileSearchResult) => void;
  handleImportContact: () => void;
  removeMember: (index: number) => void;
  handleCreateGroup: () => void;
}

const toEnhancedGroupMember = (member: AddGroupMemberEntry): EnhancedGroup['members'][number] => {
  const email = member.inviteEmail || (member.supabaseUserId ? member.inviteEmail : undefined);
  const now = new Date();

  return {
    id: member.id,
    name: member.name || member.inviteEmail || 'Guest',
    email: email || '',
    phone: member.phone || '',
    balance: 0,
    totalPaid: 0,
    totalOwed: 0,
    joinedAt: now,
    isActive: true,
    role: member.role,
    supabaseUserId: member.supabaseUserId,
    inviteEmail: email,
    inviteStatus: member.inviteStatus || 'pending',
    avatarUrl: member.avatarUrl,
    createdAt: now,
    updatedAt: now,
    permissions: {
      canAddExpenses: true,
      canEditExpenses: member.role === 'owner',
      canInviteMembers: member.role === 'owner',
      canRemoveMembers: member.role === 'owner',
      canEditGroup: member.role === 'owner',
    },
  };
};

export const useAddGroupScreen = (): UseAddGroupScreenResult => {
  appLogger.debug('AddGroupScreen: component rendering');

  const router = useRouter();
  const {groups} = useGroups();
  const {profile} = useUser();
  const {showAlert} = useAlert();
  const {currency, groupCurrency} = useSettings();
  const {isDarkMode} = useTamaguiTheme();
  const searchParams = useLocalSearchParams<{selectedCurrency?: string}>();
  const {onScroll, headerProps, isScrollingDown, scrollY} = useProgressiveBlurHeader({
    headerHeight: 75,
    showBackButtonInNonBlur: false,
  });

  const defaultCurrency = currency || groupCurrency || 'USD';

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupEmoji, setGroupEmoji] = useState('🪙');
  const [members, setMembers] = useState<AddGroupMemberEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(
    searchParams.selectedCurrency || defaultCurrency,
  );
  const [hasCreatedGroup, setHasCreatedGroup] = useState(false);
  const hasCreatedGroupRef = useRef(false);

  const currentUserName = profile?.firstName || profile?.displayName || 'User';
  const currentUserId = profile?.id;
  const memberEditor = useGroupMemberEditor({
    members,
    setGroupEmoji,
    setMembers,
    showAlert,
    showContactErrorAlert: true,
  });
  const {removeMemberAtIndex} = memberEditor;

  useEffect(() => {
    if (currentUserName && members.length === 0) {
      setMembers([
        {
          id: currentUserId || 'owner-me',
          name: currentUserName,
          role: 'owner',
          supabaseUserId: currentUserId || undefined,
          inviteStatus: 'accepted',
          avatarUrl: profile?.profilePictureUri || undefined,
        },
      ]);
    }
  }, [currentUserId, currentUserName, members.length, profile?.profilePictureUri]);

  useEffect(() => {
    if (searchParams.selectedCurrency) {
      appLogger.debug(
        'AddGroupScreen: received selectedCurrency from picker',
        searchParams.selectedCurrency,
      );
      setSelectedCurrency(searchParams.selectedCurrency);
    }
  }, [searchParams.selectedCurrency]);

  useEffect(() => {
    if (!searchParams.selectedCurrency && defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [defaultCurrency, searchParams.selectedCurrency]);

  useEffect(() => {
    if (members.length === 0 || members[0]?.role !== 'owner') return;

    setMembers((previous) => {
      const owner = previous[0];
      if (!owner) return previous;

      if (owner.name === currentUserName && (!currentUserId || owner.id === currentUserId)) {
        return previous;
      }

      const next = [...previous];
      next[0] = {
        ...owner,
        name: currentUserName,
        id: currentUserId || owner.id,
        supabaseUserId: currentUserId || owner.supabaseUserId,
      };
      return next;
    });
  }, [currentUserId, currentUserName, members.length]);

  const navigateBack = useCallback(() => router.back(), [router]);
  const navigateToCurrencyPicker = useCallback(() => {
    router.push({
      pathname: '/group-currency-picker',
      params: {currentCurrency: selectedCurrency, returnTo: 'add-group'},
    });
  }, [router, selectedCurrency]);

  const applyTemplate = useCallback((template: {name: string; emoji: string}) => {
    setGroupName(template.name);
    setGroupEmoji(template.emoji);
  }, []);

  const removeMember = useCallback(
    (index: number) => {
      if (members.length <= 1) return;

      const member = members[index];
      if (member?.role === 'owner') {
        showAlert({
          title: 'Cannot Remove',
          message: 'You cannot remove yourself as the group creator.',
          actions: [{text: 'OK'}],
        });
        return;
      }

      removeMemberAtIndex(index);
    },
    [members, removeMemberAtIndex, showAlert],
  );

  const handleCreateGroup = useCallback(() => {
    void (async () => {
      if (loading || hasCreatedGroupRef.current) {
        return;
      }

      const trimmedName = groupName.trim();
      if (!trimmedName) {
        showAlert({
          title: 'Missing Information',
          message: 'Please enter a group name',
          actions: [{text: 'OK'}],
        });
        return;
      }

      const existing = groups.items.find(
        (g) => g.name.toLowerCase().trim() === trimmedName.toLowerCase(),
      );
      if (existing) {
        showAlert({
          title: 'Group Already Exists',
          message: `A group named "${trimmedName}" already exists. You can view it or choose a different name.`,
          actions: [
            {
              text: 'View Group',
              onPress: () => {
                router.replace({
                  pathname: '/groups/[id]',
                  params: {id: existing.id},
                });
              },
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ],
        });
        return;
      }

      const validMembers = members.filter(
        (member) => member.name.trim().length > 0 || Boolean(member.inviteEmail),
      );

      if (validMembers.length === 0) {
        showAlert({
          title: 'Missing Members',
          message: 'Please add at least one member',
          actions: [{text: 'OK'}],
        });
        return;
      }

      setLoading(true);
      try {
        await groups.add({
          name: trimmedName,
          description: groupDescription.trim(),
          emoji: groupEmoji,
          members: validMembers.map(toEnhancedGroupMember),
          transactions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: currentUserId || '',
          currency: selectedCurrency,
          isActive: true,
          settings: {
            allowMemberInvites: true,
            requireApprovalForExpenses: false,
            defaultSplitMethod: 'equal',
          },
        });

        hasCreatedGroupRef.current = true;
        setHasCreatedGroup(true);

        showAlert({
          title: 'Success',
          message: `"${trimmedName}" group has been created successfully.`,
          actions: [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ],
          onDismiss: () => router.back(),
        });
      } catch (error) {
        appLogger.error('AddGroupScreen: error creating group', error);
        const isDuplicate =
          error instanceof Error && error.message.toLowerCase().includes('already exists');
        if (isDuplicate) {
          const duplicateGroup = groups.items.find(
            (g) => g.name.toLowerCase().trim() === trimmedName.toLowerCase(),
          );
          showAlert({
            title: 'Group Already Exists',
            message: `A group named "${trimmedName}" already exists. You can view it or choose a different name.`,
            actions: [
              ...(duplicateGroup
                ? [
                    {
                      text: 'View Group',
                      onPress: () => {
                        router.replace({
                          pathname: '/groups/[id]',
                          params: {id: duplicateGroup.id},
                        });
                      },
                    },
                  ]
                : []),
              {
                text: 'OK',
                style: 'cancel',
              },
            ],
          });
        } else {
          showAlert({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Error saving group',
            actions: [{text: 'OK'}],
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [
    currentUserId,
    groupDescription,
    groupEmoji,
    groupName,
    groups,
    loading,
    members,
    router,
    selectedCurrency,
    showAlert,
  ]);

  return {
    groupName,
    groupDescription,
    groupEmoji,
    members,
    searchQuery: memberEditor.searchQuery,
    isSearching: memberEditor.isSearching,
    searchResults: memberEditor.searchResults,
    isDarkMode,
    isDescriptionExpanded: memberEditor.isDescriptionExpanded,
    loading,
    selectedCurrency,
    showEmojiPicker: memberEditor.showEmojiPicker,
    isCreateDisabled: loading || !groupName.trim() || hasCreatedGroup || hasCreatedGroupRef.current,
    headerProps,
    onScroll,
    isScrollingDown,
    scrollY,
    navigateBack,
    navigateToCurrencyPicker,
    setGroupName,
    setGroupDescription,
    setSearchQuery: memberEditor.setSearchQuery,
    clearSearchResults: memberEditor.clearSearchResults,
    applyTemplate,
    openEmojiPicker: memberEditor.openEmojiPicker,
    closeEmojiPicker: memberEditor.closeEmojiPicker,
    selectEmoji: memberEditor.selectEmoji,
    toggleDescriptionExpand: memberEditor.toggleDescriptionExpand,
    handleAddFoundUser: memberEditor.handleAddFoundUser,
    handleImportContact: memberEditor.handleImportContact,
    removeMember,
    handleCreateGroup,
  };
};
