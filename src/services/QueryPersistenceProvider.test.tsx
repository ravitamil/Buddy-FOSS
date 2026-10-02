import React, {useEffect} from 'react';
import {act, render, waitFor} from '@testing-library/react-native';
import {useQuery} from '@tanstack/react-query';
import type {PersistedClient, Persister} from '@tanstack/query-persist-client-core';

import {
  clearQueryState,
  createStableQueryPersister,
  queryClient,
  queryPersister,
  QueryPersistenceProvider,
} from './QueryPersistenceProvider';
import {offlineMutationQueue} from './OfflineMutationQueue';

jest.mock('./MMKVPersister', () => {
  const noOpPersister = {
    persistClient: jest.fn(),
    restoreClient: jest.fn(() => undefined),
    removeClient: jest.fn(),
  };

  return {
    createPersister: jest.fn(() => noOpPersister),
    createNoopPersister: jest.fn(() => noOpPersister),
  };
});
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
  },
}));
jest.mock('./StartupTelemetry', () => ({markStartupPhase: jest.fn()}));
jest.mock('./OfflineMutationQueue', () => ({
  offlineMutationQueue: {
    clear: jest.fn(() => Promise.resolve()),
    listenAndReplay: jest.fn(() => jest.fn()),
  },
}));

describe('QueryPersistenceProvider startup behavior', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('keeps children mounted and pauses queries until restoration completes', async () => {
    let resolveRestore: ((client: PersistedClient | undefined) => void) | undefined;
    const restorePromise = new Promise<PersistedClient | undefined>((resolve) => {
      resolveRestore = resolve;
    });
    const persister: Persister = {
      persistClient: jest.fn(),
      restoreClient: jest.fn(() => restorePromise),
      removeClient: jest.fn(),
    };
    const queryFn = jest.fn(() => Promise.resolve('ready'));
    const mountEffect = jest.fn();

    const Probe = () => {
      useEffect(() => {
        mountEffect();
      }, []);
      const query = useQuery({queryKey: ['startup-probe'], queryFn});
      return React.createElement('Text', null, query.data ?? 'waiting');
    };

    const screen = render(
      <QueryPersistenceProvider persister={persister}>
        <Probe />
      </QueryPersistenceProvider>,
    );

    expect(screen.getByText('waiting')).toBeTruthy();
    expect(queryFn).not.toHaveBeenCalled();
    expect(mountEffect).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRestore?.(undefined);
      await restorePromise;
    });

    await waitFor(() => expect(screen.getByText('ready')).toBeTruthy());
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(mountEffect).toHaveBeenCalledTimes(1);
  });

  it('returns a stable no-op persister when MMKV creation fails', () => {
    const persister = createStableQueryPersister(() => {
      throw new Error('MMKV unavailable');
    });

    expect(persister.restoreClient()).toBeUndefined();
    expect(persister.persistClient({} as PersistedClient)).toBeUndefined();
    expect(persister.removeClient()).toBeUndefined();
  });

  it('clears memory, persisted queries, and the offline mutation queue', async () => {
    const removeClient = jest.spyOn(queryPersister, 'removeClient');
    const clearOfflineMutations = jest.spyOn(offlineMutationQueue, 'clear');
    queryClient.setQueryData(['user-data', 'user-1'], {secret: 'cached'});

    await clearQueryState();

    expect(queryClient.getQueryData(['user-data', 'user-1'])).toBeUndefined();
    expect(removeClient).toHaveBeenCalled();
    expect(clearOfflineMutations).toHaveBeenCalled();
  });
});
