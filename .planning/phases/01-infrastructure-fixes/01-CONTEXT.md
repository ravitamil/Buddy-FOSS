# Phase 1: Infrastructure Fixes and Quick Wins - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix QueryClient defaults, build centralized query key factory, remove all mock setTimeout implementations, remove unused/duplicate dependencies, and set up offline mutation queuing. This is foundation work — no new features, no UI changes beyond chart migration. The app must build and run identically after each plan.

</domain>

<decisions>
## Implementation Decisions

### Charting library

- Keep gifted-charts, remove react-native-chart-kit and @shopify/react-native-skia
- Migrate all 8 chart-kit screens to gifted-charts in this phase (don't defer)
- Existing gifted-charts wrapper components in src/components/charts/: Claude decides whether to keep wrappers or import directly during planning

### Query key factory

- Array-based keys (TanStack Query standard pattern)
- Domain + operation granularity: e.g., `['transactions', 'list']`, `['transactions', 'detail', id]`
- Single central file at `src/lib/query-keys.ts` with all domain key families
- Key families for all 10 domains: transactions, budgets, groups, loans, investments, savings, subscriptions, categories, wallets, analytics
- Structure enables invalidating all queries for a domain (`['transactions']`) or just a specific operation (`['transactions', 'list']`)

### Claude's Discretion

- Whether to keep gifted-charts wrapper components or import directly
- Exact QueryClient gcTime/staleTime values per entity type
- MMKV persistence configuration details (maxAge, dehydration rules)
- How to handle the chart-kit → gifted-charts migration for each screen (direct replacement or wrapper adaptation)
- Offline mutation queue implementation details (conflict resolution, retry strategy)

</decisions>

<specifics>
## Specific Ideas

- No specific visual requirements for charts — functional equivalence is sufficient
- The query key factory should be simple enough that any developer can add a new domain in 5 minutes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 01-infrastructure-fixes_
_Context gathered: 2026-04-28_
