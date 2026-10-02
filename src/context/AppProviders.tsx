import React from 'react';
import {AuthProvider} from './AuthContext';
import {UserProvider} from './UserContext';
import {SettingsProvider} from './SettingsContext';
import {MembershipProvider} from './MembershipContext';
import {TamaguiProvider} from './TamaguiProvider';
import {SafeAreaProvider as CustomSafeAreaProvider} from './SafeAreaProvider';
import {ToastProvider} from './ToastContext';
import {AlertProvider} from '../hooks/useAlert';
import {FeatureStatusProvider} from '../features/featureControls/FeatureStatusProvider';
import {AppSystemStatusProvider, AppSystemStatusGuard} from '../features/systemStatus';

// Financial Core Providers
import {CategoryProvider} from './CategoryContext';
import {TransactionProvider} from './TransactionContext';

// Feature Module Providers
import {GroupProvider} from './GroupContext';
import {LoanQueryProvider} from './LoanContext.query';
import {SubscriptionQueryProvider} from './SubscriptionContext.query';
import {InvestmentProvider} from './InvestmentContext';

import {AutoTransactionInitializer} from '@/features/startup/initializers/AutoTransactionInitializer';
import {NotificationInitializer} from '@/features/startup/initializers/NotificationInitializer';

interface AppProvidersProps {
  children: React.ReactNode;
}

import {QueryPersistenceProvider} from '../services/QueryPersistenceProvider';

import {OfflineNotice} from '../components/ui/OfflineNotice';

type ProviderComponent = React.ComponentType<{children: React.ReactNode}>;

const composeProviders = (providers: ProviderComponent[], children: React.ReactNode) =>
  providers.reduceRight((content, Provider) => <Provider>{content}</Provider>, children);

const IdentityProviders: React.FC<AppProvidersProps> = ({children}) =>
  composeProviders([AuthProvider, UserProvider, SettingsProvider, MembershipProvider], children);

const UIProviders: React.FC<AppProvidersProps> = ({children}) => (
  <TamaguiProvider>
    <CustomSafeAreaProvider>
      <OfflineNotice />
      <ToastProvider>
        <AlertProvider>
          <AppSystemStatusGuard>{children}</AppSystemStatusGuard>
        </AlertProvider>
      </ToastProvider>
    </CustomSafeAreaProvider>
  </TamaguiProvider>
);

const dataDomainProviders: ProviderComponent[] = [
  CategoryProvider,
  TransactionProvider,
  GroupProvider,
  LoanQueryProvider,
  SubscriptionQueryProvider,
  InvestmentProvider,
];

const DomainDataProviders: React.FC<AppProvidersProps> = ({children}) =>
  composeProviders(
    dataDomainProviders,
    <>
      <AutoTransactionInitializer />
      <NotificationInitializer />
      {children}
    </>,
  );

/**
 * AppProviders
 *
 * The central provider wrapper for the Buddy application.
 * Implements the "Domain-Driven Modular Architecture".
 */
export const AppProviders: React.FC<AppProvidersProps> = ({children}) => {
  return (
    <QueryPersistenceProvider>
      <AppSystemStatusProvider>
        <FeatureStatusProvider>
          <IdentityProviders>
            <UIProviders>
              <DomainDataProviders>{children}</DomainDataProviders>
            </UIProviders>
          </IdentityProviders>
        </FeatureStatusProvider>
      </AppSystemStatusProvider>
    </QueryPersistenceProvider>
  );
};
