import React, {createContext, useContext, useEffect, useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {bundledFeatureConfig, getCurrentFeaturePlatform, resolveFeatureControls} from './resolver';
import {fetchFeatureControlRows} from './service';
import {setRuntimeFeatureConfig} from './runtime';
import type {ResolvedFeatureConfig} from './types';
import {logger as appLogger} from '@/services/LoggerService';

const logger = appLogger.contextLogger('FeatureStatusProvider');

interface FeatureStatusContextValue {
  config: ResolvedFeatureConfig;
  isLoading: boolean;
  isRemoteError: boolean;
}

const FeatureStatusContext = createContext<FeatureStatusContextValue>({
  config: bundledFeatureConfig,
  isLoading: false,
  isRemoteError: false,
});

export function FeatureStatusProvider({children}: {children: React.ReactNode}) {
  const platform = getCurrentFeaturePlatform();

  const query = useQuery({
    queryKey: ['featureControls', platform],
    queryFn: () => fetchFeatureControlRows(platform),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const config = useMemo(() => {
    if (query.data) {
      return resolveFeatureControls(query.data, query.isFetchedAfterMount ? 'remote' : 'cache');
    }
    return bundledFeatureConfig;
  }, [query.data, query.isFetchedAfterMount]);

  useEffect(() => {
    setRuntimeFeatureConfig(config);
  }, [config]);

  useEffect(() => {
    if (query.isError) {
      logger.warn('Feature-control refresh failed; retaining local startup configuration', {
        hasRestoredConfig: Boolean(query.data),
      });
    }
  }, [query.data, query.isError]);

  const value = useMemo(
    () => ({
      config,
      isLoading: query.isLoading,
      isRemoteError: query.isError,
    }),
    [config, query.isError, query.isLoading],
  );

  return <FeatureStatusContext.Provider value={value}>{children}</FeatureStatusContext.Provider>;
}

export const useFeatureStatusContext = () => useContext(FeatureStatusContext);
