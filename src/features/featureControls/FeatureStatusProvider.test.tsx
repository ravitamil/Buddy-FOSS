import React from 'react';
import {renderHook} from '@testing-library/react-native';
import {useQuery} from '@tanstack/react-query';

import {FeatureStatusProvider, useFeatureStatusContext} from './FeatureStatusProvider';
import type {FeatureControlRow} from './types';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));
jest.mock('./service', () => ({fetchFeatureControlRows: jest.fn()}));

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

const disabledTransactions: FeatureControlRow[] = [
  {
    featureKey: 'transactions',
    platform: 'all',
    environment: 'test',
    status: 'disabled',
    actionOverrides: {},
  },
];

const wrapper = ({children}: {children: React.ReactNode}) => (
  <FeatureStatusProvider>{children}</FeatureStatusProvider>
);

const setQueryState = (state: Record<string, unknown>) => {
  mockUseQuery.mockReturnValue({
    data: undefined,
    isError: false,
    isFetchedAfterMount: false,
    isLoading: false,
    ...state,
  } as ReturnType<typeof useQuery>);
};

describe('FeatureStatusProvider startup behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes reviewed bundled defaults while the first remote request is pending', () => {
    setQueryState({isLoading: true});

    const {result} = renderHook(() => useFeatureStatusContext(), {wrapper});

    expect(result.current.config.source).toBe('bundled');
    expect(result.current.config.features.home.canRead).toBe(true);
  });

  it('uses restored persisted rows before a remote fetch completes', () => {
    setQueryState({data: disabledTransactions, isFetchedAfterMount: false});

    const {result} = renderHook(() => useFeatureStatusContext(), {wrapper});

    expect(result.current.config.source).toBe('cache');
    expect(result.current.config.features.transactions.status).toBe('disabled');
  });

  it('labels rows fetched after mount as remote', () => {
    setQueryState({data: disabledTransactions, isFetchedAfterMount: true});

    const {result} = renderHook(() => useFeatureStatusContext(), {wrapper});

    expect(result.current.config.source).toBe('remote');
  });

  it('retains restored rows when remote revalidation fails', () => {
    setQueryState({data: disabledTransactions, isError: true, isFetchedAfterMount: false});

    const {result} = renderHook(() => useFeatureStatusContext(), {wrapper});

    expect(result.current.config.source).toBe('cache');
    expect(result.current.config.features.transactions.status).toBe('disabled');
    expect(result.current.isRemoteError).toBe(true);
  });
});
