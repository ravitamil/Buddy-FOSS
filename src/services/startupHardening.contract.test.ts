import fs from 'node:fs';
import path from 'node:path';

const readProjectFile = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('startup hardening contracts', () => {
  it('uses one stable persisted query provider from the first render', () => {
    const source = readProjectFile('src/services/QueryPersistenceProvider.tsx');

    expect(source).toContain('<PersistQueryClientProvider');
    expect(source).toContain("const QUERY_CACHE_BUSTER = 'buddy-query-v2'");
    expect(source).toContain('shouldDehydrateMutation: () => false');
    expect(source).not.toContain('<QueryClientProvider');
    expect(source).not.toContain('useState');
  });

  it('settles auth directly from the local auth listener without profile requests', () => {
    const authSource = readProjectFile('src/context/AuthContext.tsx');
    const unifiedSource = readProjectFile('src/services/UnifiedAuthService.ts');
    const configureSource = unifiedSource.slice(
      unifiedSource.indexOf('public async configure'),
      unifiedSource.indexOf('public async signInWithGoogle'),
    );

    expect(authSource).toContain("dispatch({type: 'SET_INITIALIZED', payload: true})");
    expect(authSource).not.toContain('restoreCachedAuthState');
    expect(authSource).not.toContain('canUserAccessMainApp');
    expect(configureSource).not.toContain(
      'this.currentUser = await this.supabaseAuthService.getCurrentUser()',
    );
  });

  it('never returns a blank startup frame from the root layout or auth guard', () => {
    const layoutSource = readProjectFile('app/_layout.tsx');
    const guardSource = readProjectFile('src/features/auth/components/AuthGuard.tsx');

    expect(layoutSource).not.toContain('return null');
    expect(guardSource).not.toContain('return null');
    expect(guardSource).toContain('StartupShell');
    expect(guardSource).toContain("guardState === 'recovery'");
    expect(guardSource).not.toContain('setTimeout');
  });

  it('keeps user caches scoped and clears query state on local-data wipe', () => {
    const storageSource = readProjectFile('src/services/storage.ts');
    const wiperSource = readProjectFile('src/utils/dataWiper.ts');
    const categoriesSource = readProjectFile(
      'src/features/categories/context/useCategoryProviderValue.ts',
    );

    expect(storageSource).toContain('setCachedProfile(userId: string');
    expect(storageSource).toContain('getCachedProfile(userId: string');
    expect(wiperSource).toContain(
      "runCleanupStep('query and offline mutation state', clearQueryState)",
    );
    expect(wiperSource).toContain('StorageService.clearCachedProfile(userId)');
    expect(categoriesSource).toContain("queryKeys.categories.list(user?.uid ?? '')");
  });

  it('defers authenticated boot services and removes startup offerings', () => {
    const autoSource = readProjectFile(
      'src/features/startup/initializers/AutoTransactionInitializer.tsx',
    );
    const notificationSource = readProjectFile(
      'src/features/startup/initializers/NotificationInitializer.tsx',
    );
    const membershipSource = readProjectFile('src/context/MembershipContext.tsx');

    expect(autoSource).toContain('useIsRestoring');
    expect(autoSource).toContain('InteractionManager.runAfterInteractions');
    expect(notificationSource).toContain('InteractionManager.runAfterInteractions');
    expect(notificationSource).toContain('initializedForUser');
    expect(membershipSource).toContain('isPro: true');
    expect(membershipSource).not.toContain('react-native-purchases');
    expect(autoSource).toContain('profile?.isOnboardingComplete');
    expect(autoSource).toContain('abortController.abort()');
    expect(membershipSource).not.toContain('getOfferings');
    expect(membershipSource).not.toContain('offerings:');
  });

  it('uses persisted query state as the only feature-control cache', () => {
    const providerSource = readProjectFile(
      'src/features/featureControls/FeatureStatusProvider.tsx',
    );
    const serviceSource = readProjectFile('src/features/featureControls/service.ts');

    expect(providerSource).toContain("query.isFetchedAfterMount ? 'remote' : 'cache'");
    expect(serviceSource).not.toContain('AsyncStorage');
    expect(serviceSource).not.toContain('FEATURE_CONTROLS_CACHE_KEY');
  });
});
