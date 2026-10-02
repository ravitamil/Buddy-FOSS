import React, {useEffect} from 'react';
import {QueryClient, onlineManager} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import type {Persister} from '@tanstack/query-persist-client-core';
import {createNoopPersister, createPersister} from './MMKVPersister';
import {logger as appLogger} from './LoggerService';
import NetInfo from '@react-native-community/netinfo';
import {offlineMutationQueue} from './OfflineMutationQueue';
import {markStartupPhase} from './StartupTelemetry';

const QUERY_CACHE_BUSTER = 'buddy-query-v2';
const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24;

// Configure React Query to use NetInfo for online status
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export const createStableQueryPersister = (
  factory: () => Persister = createPersister,
): Persister => {
  try {
    return factory();
  } catch (error) {
    appLogger.error('Failed to initialize encrypted query persistence; using memory only', error);
    return createNoopPersister();
  }
};

export const queryPersister = createStableQueryPersister();

export const clearQueryState = async (): Promise<void> => {
  try {
    await queryClient.cancelQueries();
  } catch (error) {
    appLogger.warn('Failed to cancel active queries during cache reset', error);
  }

  queryClient.clear();

  const clearPersistedQueries = async () => {
    await queryPersister.removeClient();
  };

  const cleanupResults = await Promise.allSettled([
    clearPersistedQueries(),
    offlineMutationQueue.clear(),
  ]);

  cleanupResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      const target = index === 0 ? 'persisted queries' : 'offline mutations';
      appLogger.warn(`Failed to clear ${target}`, result.reason);
    }
  });
};

interface QueryPersistenceProviderProps {
  children: React.ReactNode;
  persister?: Persister;
}

export const QueryPersistenceProvider: React.FC<QueryPersistenceProviderProps> = ({
  children,
  persister = queryPersister,
}) => {
  // Listen for connectivity and replay offline mutations on reconnect
  useEffect(() => {
    const cleanup = offlineMutationQueue.listenAndReplay(async () => {
      appLogger.info('Replaying offline mutations on reconnect');
      await queryClient.resumePausedMutations();
    });

    return () => cleanup();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: QUERY_CACHE_BUSTER,
        maxAge: QUERY_CACHE_MAX_AGE,
        dehydrateOptions: {
          shouldDehydrateMutation: () => false,
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' && query.state.data !== undefined,
        },
      }}
      onSuccess={() => {
        markStartupPhase('query_restored');
        appLogger.info('Query cache successfully hydrated from persistent storage');
        void queryClient.resumePausedMutations().then(() => {
          appLogger.info('Paused mutations resumed');
        });
      }}
      onError={() => {
        markStartupPhase('query_restored');
        appLogger.warn('Query cache restoration failed; continuing with an empty in-memory cache');
      }}>
      {children}
    </PersistQueryClientProvider>
  );
};
