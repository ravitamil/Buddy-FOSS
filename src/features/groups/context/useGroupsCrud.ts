import {useMemo} from 'react';
import {UseQueryResult, useMutation, useQuery} from '@tanstack/react-query';
import type {QueryClient} from '@tanstack/react-query';

import {groupService} from '@/features/groups/service';
import {queryKeys} from '@/lib/query-keys';
import {GroupActivityService} from '@/services/GroupActivityService';
import type {CRUDOperations} from '@/types/context-foundation';
import {generateEntityId} from '@/types/context-foundation';
import type {EnhancedGroup} from '@/features/groups/types';
import {runV1Migration} from '@/utils/migrations/v1-migration';
import {useFeatureActionGuard, useFeatureStatus} from '@/features/featureControls';

interface GroupsCrudLogger {
  info: (message: string, metadata?: Record<string, unknown>) => void;
  error: (message: string, error?: unknown) => void;
}

interface GroupProviderUser {
  uid?: string | null;
  displayName?: string | null;
}

interface UseGroupsCrudParams {
  user: GroupProviderUser | null | undefined;
  groupCurrency: string | undefined;
  queryClient: QueryClient;
  logger: GroupsCrudLogger;
}

interface UseGroupsCrudResult {
  groupsData: EnhancedGroup[];
  groupsCRUD: CRUDOperations<EnhancedGroup>;
  query: Pick<UseQueryResult<EnhancedGroup[], Error>, 'refetch' | 'error'>;
}

const getErrorMessage = (error: unknown): string | null => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return null;
};

export const useGroupsCrud = ({
  user,
  groupCurrency,
  queryClient,
  logger,
}: UseGroupsCrudParams): UseGroupsCrudResult => {
  const createAccess = useFeatureActionGuard('groups.create');
  const updateAccess = useFeatureActionGuard('groups.update');
  const deleteAccess = useFeatureActionGuard('groups.delete');
  const feature = useFeatureStatus('groups');
  const {
    data: groupsData = [],
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.groups.list(user?.uid ?? ''),
    queryFn: async () => {
      if (!user?.uid) {
        logger.info('No user UID, returning empty groups');
        return [];
      }

      logger.info('Fetching groups from Supabase...', {userId: user.uid});
      try {
        const fetchedGroups = await groupService.getAll(user.uid);
        logger.info('Fetched groups from database', {count: fetchedGroups.length});

        const migratedGroups = runV1Migration(fetchedGroups, groupCurrency || 'USD');
        logger.info('Migration result (V1)', {
          originalCount: fetchedGroups.length,
          migratedCount: Array.isArray(migratedGroups) ? migratedGroups.length : 'unknown',
          isPromise: migratedGroups instanceof Promise,
        });

        return Promise.resolve(migratedGroups);
      } catch (err) {
        logger.error('Error in groups queryFn', err);
        throw err;
      }
    },
    enabled: Boolean(user?.uid && feature.canRead),
  });

  const error = useMemo(() => getErrorMessage(queryError), [queryError]);

  const addGroupMutation = useMutation({
    mutationFn: async (item: Omit<EnhancedGroup, 'id'>) => {
      createAccess.assertAllowed();
      if (!user?.uid) throw new Error('User not authenticated');

      const existingGroup = groupsData.find(
        (group) => group.name.toLowerCase().trim() === item.name.toLowerCase().trim(),
      );
      if (existingGroup) {
        throw new Error('A group with this name already exists.');
      }

      const newGroup: EnhancedGroup = {
        ...item,
        id: generateEntityId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      await groupService.create(user.uid, newGroup);
      return newGroup;
    },
    onSuccess: (newGroup) => {
      const listKey = queryKeys.groups.list(user?.uid ?? '');
      queryClient.setQueryData(listKey, (old: EnhancedGroup[] = []) => [newGroup, ...old]);
      void queryClient.invalidateQueries({queryKey: listKey});
      logger.info('Group added successfully', {groupId: newGroup.id});

      const otherMembers = newGroup.members
        .filter((member) => member.id !== user?.uid)
        .map((member) => member.name)
        .join(', ');

      void GroupActivityService.logActivity(
        newGroup.id,
        user?.uid || 'system',
        user?.displayName || 'Unknown',
        'group_created',
        {
          groupName: newGroup.name,
          memberNames: otherMembers || undefined,
        },
      );
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<EnhancedGroup>}) => {
      updateAccess.assertAllowed();
      if (!user?.uid) throw new Error('User not authenticated');

      const group = groupsData.find((candidate) => candidate.id === id);
      if (!group) throw new Error('Group not found');

      if (updates.name) {
        const existingGroup = groupsData.find(
          (candidate) =>
            candidate.id !== id &&
            candidate.name.toLowerCase().trim() === updates.name!.toLowerCase().trim(),
        );
        if (existingGroup) {
          throw new Error('A group with this name already exists.');
        }
      }

      const updatedGroup = {...group, ...updates, updatedAt: new Date()};
      await groupService.update(user.uid, updatedGroup);
      return updatedGroup;
    },
    onSuccess: (updatedGroup) => {
      const listKey = queryKeys.groups.list(user?.uid ?? '');
      queryClient.setQueryData(listKey, (old: EnhancedGroup[] = []) =>
        old.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)),
      );
      void queryClient.invalidateQueries({queryKey: listKey});
      logger.info('Group updated successfully', {groupId: updatedGroup.id});
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteAccess.assertAllowed();
      if (!user?.uid) throw new Error('User not authenticated');
      await groupService.delete(user.uid, id);
      return id;
    },
    onSuccess: (deletedId) => {
      const listKey = queryKeys.groups.list(user?.uid ?? '');
      queryClient.setQueryData(listKey, (old: EnhancedGroup[] = []) =>
        old.filter((group) => group.id !== deletedId),
      );
      void queryClient.invalidateQueries({queryKey: listKey});
      logger.info('Group deleted successfully', {groupId: deletedId});
    },
  });

  const groupsCRUD = useMemo<CRUDOperations<EnhancedGroup>>(
    () => ({
      items: groupsData,
      getById: (id: string) => groupsData.find((group) => group.id === id) || null,
      add: async (item: Omit<EnhancedGroup, 'id'>) => addGroupMutation.mutateAsync(item),
      update: async (id: string, updates: Partial<EnhancedGroup>) => {
        await updateGroupMutation.mutateAsync({id, updates});
      },
      delete: async (id: string) => {
        await deleteGroupMutation.mutateAsync(id);
      },
      addMany: async (items: Omit<EnhancedGroup, 'id'>[]) => {
        const results = [];
        for (const item of items) {
          results.push(await addGroupMutation.mutateAsync(item));
        }
        return results;
      },
      deleteMany: async (ids: string[]) => {
        for (const id of ids) {
          await deleteGroupMutation.mutateAsync(id);
        }
      },
      isLoading:
        isQueryLoading ||
        addGroupMutation.isPending ||
        updateGroupMutation.isPending ||
        deleteGroupMutation.isPending,
      error,
    }),
    [groupsData, isQueryLoading, addGroupMutation, updateGroupMutation, deleteGroupMutation, error],
  );

  return {
    groupsData,
    groupsCRUD,
    query: {refetch, error: queryError},
  };
};
