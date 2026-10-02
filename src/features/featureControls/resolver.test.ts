import {resolveFeatureControls, getRouteControlForPath} from './resolver';
import type {FeatureControlRow} from './types';

describe('feature control resolver', () => {
  it('resolves bundled defaults as enabled', () => {
    const config = resolveFeatureControls([], 'bundled');

    expect(config.features.groups.status).toBe('enabled');
    expect(config.actions['groups.create'].isAllowed).toBe(true);
  });

  it('blocks write actions when a data feature is read only', () => {
    const rows: FeatureControlRow[] = [
      {
        featureKey: 'groups',
        platform: 'ios',
        environment: 'production',
        status: 'read_only',
        actionOverrides: {},
      },
    ];

    const config = resolveFeatureControls(rows, 'remote');

    expect(config.features.groups.canRead).toBe(true);
    expect(config.features.groups.canWrite).toBe(false);
    expect(config.actions['groups.create'].isAllowed).toBe(false);
  });

  it('allows action overrides to reopen selected actions unless the feature is hard blocked', () => {
    const rows: FeatureControlRow[] = [
      {
        featureKey: 'groups',
        platform: 'ios',
        environment: 'production',
        status: 'read_only',
        actionOverrides: {'groups.settle': 'enabled'},
      },
    ];

    const config = resolveFeatureControls(rows, 'remote');

    expect(config.actions['groups.create'].isAllowed).toBe(false);
    expect(config.actions['groups.settle'].isAllowed).toBe(true);
  });

  it('treats hidden as a hard block even when an action override is enabled', () => {
    const rows: FeatureControlRow[] = [
      {
        featureKey: 'groups',
        platform: 'ios',
        environment: 'production',
        status: 'hidden',
        actionOverrides: {'groups.create': 'enabled'},
      },
    ];

    const config = resolveFeatureControls(rows, 'remote');

    expect(config.features.groups.isVisible).toBe(false);
    expect(config.actions['groups.create'].isAllowed).toBe(false);
  });

  it('keeps reporting read-only statuses effectively enabled', () => {
    const rows: FeatureControlRow[] = [
      {
        featureKey: 'analytics',
        platform: 'ios',
        environment: 'production',
        status: 'read_only',
        actionOverrides: {},
      },
    ];

    const config = resolveFeatureControls(rows, 'remote');

    expect(config.features.analytics.status).toBe('enabled');
    expect(config.actions['analytics.view'].isAllowed).toBe(true);
  });

  it('finds route controls for direct deep links', () => {
    expect(getRouteControlForPath('/groups/abc/add-transaction')?.action).toBe('groups.addExpense');
    expect(getRouteControlForPath('/invite/group/abc')?.action).toBe('groups.acceptInvite');
    expect(getRouteControlForPath('/add-edit-loan')?.actions).toEqual([
      'loans.create',
      'loans.update',
    ]);
  });

  it('maps net-worth routes to wallets so disabling wallets blocks net-worth access', () => {
    const routeControl = getRouteControlForPath('/net-worth');
    const config = resolveFeatureControls(
      [
        {
          featureKey: 'wallets',
          platform: 'ios',
          environment: 'production',
          status: 'disabled',
          actionOverrides: {},
        },
      ],
      'remote',
    );

    expect(routeControl?.feature).toBe('wallets');
    expect(config.features.wallets.isVisible).toBe(false);
    expect(config.features.wallets.canRead).toBe(false);
  });

  it('blocks dependent features and their action overrides when a dependency is unavailable', () => {
    const config = resolveFeatureControls(
      [
        {
          featureKey: 'categories',
          platform: 'ios',
          environment: 'production',
          status: 'disabled',
          actionOverrides: {},
        },
        {
          featureKey: 'transactions',
          platform: 'ios',
          environment: 'production',
          status: 'enabled',
          actionOverrides: {'transactions.create': 'enabled'},
        },
      ],
      'remote',
    );

    expect(config.features.transactions.status).toBe('maintenance');
    expect(config.features.budgets.status).toBe('maintenance');
    expect(config.actions['transactions.create'].isAllowed).toBe(false);
  });

  it('does not block aggregate shells when an optional child feature is unavailable', () => {
    const config = resolveFeatureControls(
      [
        {
          featureKey: 'savings',
          platform: 'ios',
          environment: 'production',
          status: 'disabled',
          actionOverrides: {},
        },
      ],
      'remote',
    );

    expect(config.features.trackers.status).toBe('enabled');
    expect(config.features.wallets.status).toBe('enabled');
    expect(config.features.analytics.status).toBe('enabled');
  });
});
