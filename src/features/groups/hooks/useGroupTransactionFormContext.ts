import {useCallback, useMemo} from 'react';
import {getCurrencySymbol} from '@/constants/currencies';
import {findCurrentUserMember} from '@/utils/userUtils';
import type {
  AddGroupTransactionCategory,
  GroupWithAvatarMembers,
} from '../types/addGroupTransaction';
import {getExpenseCategories} from '../utils/groupTransactionFormUtils';

interface GroupTransactionProfile {
  firstName?: string | null;
  displayName?: string | null;
}

interface GroupTransactionUser {
  displayName?: string | null;
}

interface UseGroupTransactionFormContextArgs {
  groups: GroupWithAvatarMembers[];
  groupId: string;
  profile?: GroupTransactionProfile | null;
  user?: GroupTransactionUser | null;
  currency: string;
  categories: Array<{type: string; name: string}>;
}

export interface GroupTransactionFormContext {
  group: GroupWithAvatarMembers | null;
  userFirstName?: string;
  currencySymbol: string;
  getUserDisplayName: () => string;
  currentUserMember?: GroupWithAvatarMembers['members'][number];
  expenseCategories: AddGroupTransactionCategory[];
}

export function useGroupTransactionFormContext({
  groups,
  groupId,
  profile,
  user,
  currency,
  categories,
}: UseGroupTransactionFormContextArgs): GroupTransactionFormContext {
  const group = groups.find((item) => item.id === groupId) ?? null;
  const userFirstName = profile?.firstName ?? undefined;
  const currencySymbol = getCurrencySymbol(currency);

  const getUserDisplayName = useCallback(
    () => profile?.displayName || profile?.firstName || user?.displayName || 'User',
    [profile?.displayName, profile?.firstName, user?.displayName],
  );

  const currentUserMember = findCurrentUserMember(
    group?.members ?? [],
    userFirstName,
    undefined,
    getUserDisplayName,
  );

  const expenseCategories = useMemo(() => getExpenseCategories(categories), [categories]);

  return {
    group,
    userFirstName,
    currencySymbol,
    getUserDisplayName,
    currentUserMember,
    expenseCategories,
  };
}
