/**
 * Central Query Key Factory
 *
 * Array-based hierarchical query keys for all 10 domain families.
 * Structure enables prefix invalidation:
 *   queryClient.invalidateQueries({ queryKey: ['transactions'] })
 * matches ALL transaction queries regardless of UID or operation.
 *
 * Key hierarchy per domain:
 *   all       -> ['domain']
 *   lists()   -> ['domain', 'list']
 *   list(uid) -> ['domain', 'list', uid]
 *   details() -> ['domain', 'detail']
 *   detail(uid, id) -> ['domain', 'detail', uid, id]
 *
 * UID is placed AFTER the operation discriminator so that
 * `['transactions']` still matches via TanStack's partial key matching.
 */

export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.transactions.lists(), uid] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (uid: string, id: string) => [...queryKeys.transactions.details(), uid, id] as const,
  },

  budgets: {
    all: ['budgets'] as const,
    lists: () => [...queryKeys.budgets.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.budgets.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.budgets.all, 'detail', uid, id] as const,
    active: (uid: string) => [...queryKeys.budgets.all, 'active', uid] as const,
  },

  groups: {
    all: ['groups'] as const,
    lists: () => [...queryKeys.groups.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.groups.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.groups.all, 'detail', uid, id] as const,
  },

  loans: {
    all: ['loans'] as const,
    lists: () => [...queryKeys.loans.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.loans.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.loans.all, 'detail', uid, id] as const,
  },

  investments: {
    all: ['investments'] as const,
    portfolios: {
      all: ['investment_portfolios'] as const,
      list: (uid: string) => [...queryKeys.investments.portfolios.all, 'list', uid] as const,
    },
    categories: {
      all: ['investment_categories'] as const,
      list: (uid: string) => [...queryKeys.investments.categories.all, uid] as const,
    },
    lists: () => [...queryKeys.investments.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.investments.lists(), uid] as const,
    byPortfolio: (uid: string, portfolioId: string) =>
      [...queryKeys.investments.lists(), uid, 'portfolio', portfolioId] as const,
    detail: (uid: string, id: string) => [...queryKeys.investments.all, 'detail', uid, id] as const,
  },

  savings: {
    all: ['savings'] as const,
    lists: () => [...queryKeys.savings.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.savings.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.savings.all, 'detail', uid, id] as const,
  },

  subscriptions: {
    all: ['subscriptions'] as const,
    lists: () => [...queryKeys.subscriptions.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.subscriptions.lists(), uid] as const,
    detail: (uid: string, id: string) =>
      [...queryKeys.subscriptions.all, 'detail', uid, id] as const,
  },

  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.categories.lists(), uid] as const,
  },

  wallets: {
    all: ['wallets'] as const,
    lists: () => [...queryKeys.wallets.all, 'list'] as const,
    list: (uid: string) => [...queryKeys.wallets.lists(), uid] as const,
    detail: (uid: string, id: string) => [...queryKeys.wallets.all, 'detail', uid, id] as const,
  },

  users: {
    all: ['users'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (uid: string) => [...queryKeys.users.details(), uid] as const,
  },

  analytics: {
    all: ['analytics'] as const,
    summary: (uid: string) => [...queryKeys.analytics.all, 'summary', uid] as const,
    trends: (uid: string, range: string) =>
      [...queryKeys.analytics.all, 'trends', uid, range] as const,
  },
} as const;
