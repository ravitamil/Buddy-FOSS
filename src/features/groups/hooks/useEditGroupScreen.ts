import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'expo-router';
import type {SharedValue} from 'react-native-reanimated';

import {useGroups, useUser} from '@/context';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import type {EnhancedGroup, ProfileSearchResult} from '@/features/groups/types';
import {isCurrentUserMember} from '@/utils/userUtils';

import {
  getEditGroupValidationError,
  getValidEditGroupMembers,
  toEditableMember,
  toEnhancedGroupMember,
  type EditGroupMemberEntry,
} from './editGroupScreenModels';
import {useGroupMemberEditor} from './useGroupMemberEditor';

export type {EditGroupMemberEntry} from './editGroupScreenModels';

export interface UseEditGroupScreenResult {
  group: EnhancedGroup | null;
  groupName: string;
  groupDescription: string;
  groupEmoji: string;
  members: EditGroupMemberEntry[];
  searchQuery: string;
  isSearching: boolean;
  searchResults: ProfileSearchResult[];
  isDarkMode: boolean;
  isDeleting: boolean;
  isDescriptionExpanded: boolean;
  showEmojiPicker: boolean;
  isSaveDisabled: boolean;
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  isScrollingDown: SharedValue<boolean>;
  scrollY: SharedValue<number>;
  navigateBack: () => void;
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
  handleUpdateGroup: () => void;
  handleDeleteGroup: () => void;
}

interface UseEditGroupScreenOptions {
  groupId: string;
}

export const useEditGroupScreen = ({
  groupId,
}: UseEditGroupScreenOptions): UseEditGroupScreenResult => {
  appLogger.debug('EditGroupScreen: component rendering');

  const router = useRouter();
  const {groups} = useGroups();
  const {profile} = useUser();
  const {isDarkMode} = useTamaguiTheme();
  const {showAlert} = useAlert();
  const {onScroll, headerProps, isScrollingDown, scrollY} = useProgressiveBlurHeader({
    headerHeight: 75,
    showBackButtonInNonBlur: false,
  });

  const group = groups.items.find((item) => item.id === groupId) ?? null;
  const userFirstName = profile?.firstName ?? undefined;
  const getUserDisplayName = useCallback(
    () => profile?.firstName || profile?.displayName || 'User',
    [profile?.displayName, profile?.firstName],
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [groupName, setGroupName] = useState(group?.name || '');
  const [groupDescription, setGroupDescription] = useState(group?.description || '');
  const [groupEmoji, setGroupEmoji] = useState(group?.emoji || '👥');
  const [members, setMembers] = useState<EditGroupMemberEntry[]>([]);
  const memberEditor = useGroupMemberEditor({
    members,
    setGroupEmoji,
    setMembers,
    showAlert,
  });
  const {removeMemberAtIndex, setDescriptionExpanded} = memberEditor;

  const isCurrentUser = useCallback(
    (memberName: string) => {
      return isCurrentUserMember(memberName, userFirstName, undefined, getUserDisplayName);
    },
    [getUserDisplayName, userFirstName],
  );

  useEffect(() => {
    if (!group) return;

    setGroupName(group.name || '');
    setGroupDescription(group.description || '');
    setGroupEmoji(group.emoji || '👥');
    setMembers(group.members.map((member) => toEditableMember(member, isCurrentUser)));
    setDescriptionExpanded(Boolean(group.description?.trim()));
  }, [group, isCurrentUser, setDescriptionExpanded]);

  useEffect(() => {
    appLogger.debug('EditGroupScreen: component mounted');

    if (!group) {
      appLogger.debug('EditGroupScreen: group not found, redirecting');
      router.back();
      return undefined;
    }

    return () => {
      appLogger.debug('EditGroupScreen: component unmounting');
    };
  }, [group, router]);

  const navigateBack = useCallback(() => router.back(), [router]);

  const removeMember = useCallback(
    (index: number) => {
      if (members.length <= 1) return;

      const memberToRemove = members[index];
      if (!memberToRemove) return;

      if (isCurrentUser(memberToRemove.name)) {
        showAlert({
          title: 'Cannot Remove Creator',
          message: 'You cannot remove yourself from the group as you are the creator.',
          actions: [{text: 'OK'}],
        });
        return;
      }

      showAlert({
        title: 'Remove Member',
        message: `Are you sure you want to remove ${memberToRemove.name} from the group?`,
        actions: [
          {text: 'Cancel'},
          {
            text: 'Remove',
            variant: 'destructive',
            onPress: () => {
              removeMemberAtIndex(index);
            },
          },
        ],
      });
    },
    [isCurrentUser, members, removeMemberAtIndex, showAlert],
  );

  const handleUpdateGroup = useCallback(() => {
    void (async () => {
      appLogger.debug('EditGroupScreen: updating group');

      if (!group) {
        appLogger.debug('EditGroupScreen: no group to update');
        return;
      }

      const validationError = getEditGroupValidationError(groupName, members, group, groups.items);
      if (validationError) {
        showAlert({
          ...validationError,
          actions: [{text: 'OK'}],
        });
        return;
      }

      try {
        await groups.update(group.id, {
          name: groupName.trim(),
          description: groupDescription.trim(),
          emoji: groupEmoji,
          members: getValidEditGroupMembers(members).map(toEnhancedGroupMember),
        });
        appLogger.debug('EditGroupScreen: group updated successfully');
        router.back();
      } catch (error) {
        appLogger.error('EditGroupScreen: error updating group', error);

        if (error instanceof Error && error.message.includes('already exists')) {
          showAlert({
            title: 'Duplicate Name',
            message: error.message,
            actions: [{text: 'OK'}],
          });
          return;
        }

        showAlert({
          title: 'Error',
          message: 'Failed to update group',
          actions: [{text: 'OK'}],
        });
      }
    })();
  }, [group, groupDescription, groupEmoji, groupName, groups, members, router, showAlert]);

  const handleDeleteGroup = useCallback(() => {
    if (!group) return;

    showAlert({
      title: 'Delete Group',
      message: `Are you sure you want to delete "${groupName}"? This action cannot be undone.`,
      actions: [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          variant: 'destructive',
          onPress: () => {
            void (async () => {
              setIsDeleting(true);
              try {
                await groups.delete(group.id);
                appLogger.debug('EditGroupScreen: group deleted successfully');
                router.back();
              } catch (error) {
                appLogger.error('EditGroupScreen: error deleting group', error);
                setIsDeleting(false);
                showAlert({
                  title: 'Error',
                  message: 'Failed to delete group',
                  actions: [{text: 'OK'}],
                });
              }
            })();
          },
        },
      ],
    });
  }, [group, groupName, groups, router, showAlert]);

  const applyTemplate = useCallback((template: {name: string; emoji: string}) => {
    setGroupName(template.name);
    setGroupEmoji(template.emoji);
  }, []);

  return {
    group,
    groupName,
    groupDescription,
    groupEmoji,
    members,
    searchQuery: memberEditor.searchQuery,
    isSearching: memberEditor.isSearching,
    searchResults: memberEditor.searchResults,
    isDarkMode,
    isDeleting,
    isDescriptionExpanded: memberEditor.isDescriptionExpanded,
    showEmojiPicker: memberEditor.showEmojiPicker,
    isSaveDisabled:
      !groupName.trim() || members.filter((member) => member.name.trim()).length === 0,
    headerProps,
    onScroll,
    isScrollingDown,
    scrollY,
    navigateBack,
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
    handleUpdateGroup,
    handleDeleteGroup,
  };
};
