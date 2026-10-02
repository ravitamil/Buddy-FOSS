import {appRoutes, firstRouteParam, routeParamBoolean, routeParamString} from './routes';

describe('route contracts', () => {
  it('normalizes Expo Router string and array params', () => {
    expect(routeParamString('group-1')).toBe('group-1');
    expect(routeParamString(['group-1', 'ignored'])).toBe('group-1');
    expect(routeParamString(undefined)).toBe('');
    expect(routeParamString(undefined, 'fallback')).toBe('fallback');
    expect(firstRouteParam(['tx-1'])).toBe('tx-1');
  });

  it('normalizes boolean query params', () => {
    expect(routeParamBoolean('true')).toBe(true);
    expect(routeParamBoolean(['true'])).toBe(true);
    expect(routeParamBoolean('false')).toBe(false);
    expect(routeParamBoolean(undefined)).toBe(false);
  });

  it('builds nested group transaction paths with stable params', () => {
    expect(appRoutes.groupTransactionDetail('group-1', 'tx-2')).toEqual({
      pathname: '/groups/[groupId]/transactions/[transactionId]',
      params: {groupId: 'group-1', transactionId: 'tx-2'},
    });
  });

  it('builds group add transaction query params and drops undefined values', () => {
    expect(
      appRoutes.groupAddTransaction('group-1', {
        initialType: 'payment',
        initialPaidBy: 'member-1',
        initialReceivedBy: undefined,
        initialAmount: '42',
      }),
    ).toEqual({
      pathname: '/groups/[id]/add-transaction',
      params: {
        id: 'group-1',
        initialType: 'payment',
        initialPaidBy: 'member-1',
        initialAmount: '42',
      },
    });
  });

  it('builds detail and edit paths for route-owned ids', () => {
    expect(appRoutes.loanDetail('loan-1')).toEqual({
      pathname: '/loan-detail/[id]',
      params: {id: 'loan-1'},
    });
    expect(appRoutes.savingsGoalEdit('goal-1')).toEqual({
      pathname: '/add-savings-goal',
      params: {id: 'goal-1'},
    });
    expect(appRoutes.addEditSubscription('sub-1')).toEqual({
      pathname: '/add-edit-subscription',
      params: {subscriptionId: 'sub-1'},
    });
    expect(appRoutes.editCategory('cat-1', 'investment')).toEqual({
      pathname: '/edit-category',
      params: {id: 'cat-1', type: 'investment'},
    });
  });
});
