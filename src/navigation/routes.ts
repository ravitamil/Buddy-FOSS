import type {Href} from 'expo-router';

export type RouteParamValue = string | string[] | undefined;

export const firstRouteParam = (value: RouteParamValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const routeParamString = (value: RouteParamValue, fallback = ''): string =>
  firstRouteParam(value) ?? fallback;

export const routeParamBoolean = (value: RouteParamValue): boolean =>
  routeParamString(value).toLowerCase() === 'true';

const route = (pathname: string, params?: Record<string, string | undefined>): Href => {
  const normalizedParams = Object.fromEntries(
    Object.entries(params ?? {}).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return {
    pathname,
    params: normalizedParams,
  } as Href;
};

export const appRoutes = {
  addEditLoan: (loanId: string): Href => route('/add-edit-loan', {loanId}),
  addEditSubscription: (subscriptionId: string): Href =>
    route('/add-edit-subscription', {subscriptionId}),
  savingsGoalEdit: (goalId: string): Href => route('/add-savings-goal', {id: goalId}),
  addTransaction: (type?: string): Href => route('/add-transaction', {type}),
  editCategory: (categoryId: string, type?: string): Href =>
    route('/edit-category', {id: categoryId, type}),
  editTransaction: (transactionId: string): Href =>
    route('/add-transaction', {editId: transactionId}),
  groupActivity: (groupId: string): Href => route('/groups/[id]/activity', {id: groupId}),
  groupAddTransaction: (
    groupId: string,
    params: {
      initialType?: 'expense' | 'payment';
      initialPaidBy?: string;
      initialReceivedBy?: string;
      initialAmount?: string;
    } = {},
  ): Href => route('/groups/[id]/add-transaction', {id: groupId, ...params}),
  groupAllTransactions: (groupId: string): Href =>
    route('/groups/[id]/all-transactions', {id: groupId}),
  groupDetail: (groupId: string): Href => route('/groups/[id]', {id: groupId}),
  groupEdit: (groupId: string): Href => route('/groups/[id]/edit', {id: groupId}),
  groupEditTransaction: (groupId: string, transactionId: string): Href =>
    route('/groups/[id]/edit-transaction', {id: groupId, transactionId}),
  groupInsights: (groupId: string): Href => route('/group-insights/[id]', {id: groupId}),
  groupSettlementHistory: (groupId: string): Href =>
    route('/groups/[id]/settlement-history', {id: groupId}),
  groupTransactionDetail: (groupId: string, transactionId: string): Href =>
    route('/groups/[groupId]/transactions/[transactionId]', {groupId, transactionId}),
  investmentDetail: (investmentId: string): Href =>
    route('/investment-detail/[id]', {id: investmentId}),
  investmentCategoryEdit: (categoryId: string): Href =>
    route('/edit-investment-category/[id]', {id: categoryId}),
  loanDetail: (loanId: string): Href => route('/loan-detail/[id]', {id: loanId}),
  portfolioCategoryDetail: (categoryId: string): Href =>
    route('/portfolio-category/[id]', {id: categoryId}),
  savingsGoalDetail: (goalId: string, fromCreation?: boolean): Href =>
    route('/savings/[id]', {id: goalId, fromCreation: fromCreation ? 'true' : undefined}),
  subscriptionDetail: (subscriptionId: string): Href =>
    route('/subscription-detail/[id]', {id: subscriptionId}),
  transactions: (): Href => '/transactions',
} as const;
