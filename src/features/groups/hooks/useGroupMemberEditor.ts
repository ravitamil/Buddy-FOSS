import {useCallback, useEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';

import * as Contacts from 'expo-contacts/legacy';
import * as Crypto from 'expo-crypto';

import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';
import {GroupMemberService} from '@/services/GroupMemberService';
import type {InviteStatus, ProfileSearchResult} from '@/features/groups/types';
import {formatPhoneNumber} from '@/utils/phoneUtils';
import {requestContactsPermissionWithRationale} from '@/utils/permissions';

export interface GroupMemberDraft {
  id: string;
  name: string;
  role: 'owner' | 'member';
  supabaseUserId?: string;
  inviteEmail?: string;
  phone?: string;
  inviteStatus?: Extract<InviteStatus, 'pending' | 'accepted'>;
  avatarUrl?: string;
}

interface UseGroupMemberEditorOptions {
  members: GroupMemberDraft[];
  setGroupEmoji: (emoji: string) => void;
  setMembers: Dispatch<SetStateAction<GroupMemberDraft[]>>;
  showAlert: ReturnType<typeof useAlert>['showAlert'];
  showContactErrorAlert?: boolean;
}

export interface UseGroupMemberEditorResult {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isSearching: boolean;
  searchResults: ProfileSearchResult[];
  isDescriptionExpanded: boolean;
  showEmojiPicker: boolean;
  clearSearchResults: () => void;
  openEmojiPicker: () => void;
  closeEmojiPicker: () => void;
  selectEmoji: (emoji: string) => void;
  toggleDescriptionExpand: () => void;
  setDescriptionExpanded: (isExpanded: boolean) => void;
  handleAddFoundUser: (user: ProfileSearchResult) => void;
  handleImportContact: () => void;
  removeMemberAtIndex: (index: number) => void;
}

export const useGroupMemberEditor = ({
  members,
  setGroupEmoji,
  setMembers,
  showAlert,
  showContactErrorAlert = false,
}: UseGroupMemberEditorOptions): UseGroupMemberEditorResult => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      void (async () => {
        try {
          const result = await GroupMemberService.searchUser(trimmedQuery);
          const alreadyAdded = result
            ? members.some((member) => member.supabaseUserId === result.userId)
            : false;
          setSearchResults(result && !alreadyAdded ? [result] : []);
        } catch (error) {
          appLogger.error('Error searching members', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [members, searchQuery]);

  const clearSearchResults = useCallback(() => setSearchResults([]), []);
  const openEmojiPicker = useCallback(() => setShowEmojiPicker(true), []);
  const closeEmojiPicker = useCallback(() => setShowEmojiPicker(false), []);
  const toggleDescriptionExpand = useCallback(() => {
    setIsDescriptionExpanded((previous) => !previous);
  }, []);

  const selectEmoji = useCallback(
    (emoji: string) => {
      setGroupEmoji(emoji);
      setShowEmojiPicker(false);
    },
    [setGroupEmoji],
  );

  const handleAddFoundUser = useCallback(
    (user: ProfileSearchResult) => {
      setMembers((previous) => [
        ...previous,
        {
          id: Crypto.randomUUID(),
          name: user.displayName,
          role: 'member',
          supabaseUserId: user.userId,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          inviteEmail: user.email,
          inviteStatus: 'accepted',
        },
      ]);
      setSearchQuery('');
      setSearchResults([]);
    },
    [setMembers],
  );

  const handleImportContact = useCallback(() => {
    void (async () => {
      try {
        const permission = await requestContactsPermissionWithRationale(showAlert);
        if (!permission.granted) {
          return;
        }

        const contact = await Contacts.presentContactPickerAsync();
        if (!contact) return;

        const name =
          contact.name ||
          [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
          'Unknown';
        const phone = formatPhoneNumber(contact.phoneNumbers?.[0]?.number || '');
        const email = contact.emails?.[0]?.email;
        const alreadyAdded = members.some((member) => {
          return (
            (Boolean(member.phone) && member.phone === phone) ||
            (Boolean(email) && member.inviteEmail === email) ||
            member.name === name
          );
        });

        if (alreadyAdded) {
          showAlert({
            title: 'Already Added',
            message: `${name} is already in the group members list.`,
            actions: [{text: 'OK'}],
          });
          return;
        }

        setMembers((previous) => [
          ...previous,
          {
            id: Crypto.randomUUID(),
            name,
            role: 'member',
            inviteEmail: email,
            phone,
            inviteStatus: 'pending',
          },
        ]);
        setSearchQuery('');
        setSearchResults([]);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isCancellation =
          errorMessage.toLowerCase().includes('cancel') ||
          errorMessage.toLowerCase().includes('dismiss') ||
          (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            ((error as {code: string}).code === 'E_CONTACT_PICKER_CANCELLED' ||
              (error as {code: string}).code === 'ERR_CONTACT_PICKER_CANCELLED'));

        if (!isCancellation) {
          appLogger.error('Error with contacts picker', error);
          if (showContactErrorAlert) {
            showAlert({
              title: 'Contacts Error',
              message: 'Something went wrong while accessing your contacts. Please try again.',
              actions: [{text: 'OK'}],
            });
          }
        }
      }
    })();
  }, [members, setMembers, showAlert, showContactErrorAlert]);

  const removeMemberAtIndex = useCallback(
    (index: number) => {
      setMembers((previous) => previous.filter((_, memberIndex) => memberIndex !== index));
    },
    [setMembers],
  );

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    isDescriptionExpanded,
    showEmojiPicker,
    clearSearchResults,
    openEmojiPicker,
    closeEmojiPicker,
    selectEmoji,
    toggleDescriptionExpand,
    setDescriptionExpanded: setIsDescriptionExpanded,
    handleAddFoundUser,
    handleImportContact,
    removeMemberAtIndex,
  };
};
