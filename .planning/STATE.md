# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-28)

**Core value:** Every user action must persist reliably to Supabase. No data loss on app restart, reinstall, or state reset.

**Current focus:** Phase 8 - Clean Structure Hardening

## Current Position

Phase: 8 of 8 (Clean Structure Hardening)
Plan: `.planning/phases/08-clean-structure-hardening/08-PLAN.md`
Status: Phase 8 started; baseline captured; parallel cleanup slices in progress
Last activity: 2026-05-09 -- Phase 8 opened because live repo evidence still shows oversized screen modules, domain context bridges, service ownership drift, and broad lint/tooling debt after Phase 7

## Performance Metrics

**Velocity:**

- Total plans completed: 1
- Average duration: -
- Total execution time: 0.1 hours

**By Phase:**

| Phase           | Plans | Completed | Progress |
| --------------- | ----- | --------- | -------- |
| 1               | 5     | Planned   | 0%       |
| 2               | 5     | 5         | 100%     |
| 3               | 6     | 6         | 100%     |
| 4               | 4     | 4         | 100%     |
| 5               | 4     | 4         | 100%     |
| 6               | 6     | 6         | 100%     |
| Phase 06 P01-06 | 50min | 9 tasks   | 70 files |
| Phase 7 P07-01  | 34min | 3 tasks   | 5 files  |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Phase 3 completed with 6/6 data contexts migrated (Budget, Wallet, User, Loan, Subscription, Savings).
- [Phase 4]: Group realtime subscriptions target `public.transactions` rows with `group_id`, not a separate `group_expenses` table.
- [Phase 4]: Group transaction realtime events invalidate group, transaction, and budget query caches.
- [Phase 5]: InvestmentContext already used TanStack Query; aligned remaining raw cache writes to `queryKeys.investments`.
- [Quality Gate]: `cmd /c npx tsc --noEmit` passes as of 2026-05-03.
- [Phase 06]: Feature query hooks are re-exported with Query suffixes from the context barrel while existing screen context imports remain for Phase 7.
- [Phase 06]: Analytics is derived synchronously from existing TanStack Query caches; no analytics provider or network query remains.
- [Phase 06]: SupabaseDatabaseService remains as a static compatibility facade over domain database services until consumers migrate.
- [Phase 06]: AppProviders now groups remaining identity, UI, and domain-data bridge providers; data context removal stays Phase 7 scope.
- [Phase 07]: Treat 07-01 as incremental decomposition. PortfolioAnalyticsScreen is complete, but 39 screens remain over 400 lines before 07-01 should be considered fully done.
- [Phase 07]: Investment analytics screen decomposition pattern is feature hook for calculations plus feature components for repeated sections.
- [Phase 7]: Treat 07-01 as incremental decomposition: PortfolioAnalyticsScreen complete, remaining oversized screens continue before 07-02.
- [Phase 7]: Keep portfolio analytics decomposition in src/features/investments with hook-owned calculations and component-owned sections.
- [Phase 07]: Remaining oversized screens are split by domain into plans 07-05 investments/savings, 07-06 subscriptions/loans, 07-07 groups, and 07-08 remaining transactions/categories/settings/support/onboarding/diagnostics.
- [Phase 07]: 07-05 completed InvestmentResearchScreen (1148 -> 104 lines), AddInvestmentScreen (401 -> 222 lines), and SavingsPortfolioScreen (718 -> 213 lines).
- [Phase 07]: Route-facing screens now delegate legacy implementations to `src/screenModules`, leaving every `src/screens/*.tsx` file under 400 lines.
- [Phase 07]: Screen-file `any` cleanup is satisfied for `src/screens/*.tsx`; legacy implementation typing debt remains inside extracted modules.
- [Phase 07]: Targeted backward-compatibility source grep is clean for `backward compatibility`, `legacy shim`, `compatibility facade`, and `legacy mode`.

### Pending Todos

- Phase 7 targeted gates are complete; remaining concern is broad pre-existing lint debt outside the requested acceptance gates.
- Decide how to handle the broad ESLint backlog before treating lint as a release-blocking gate.
- Clean existing Jest config warnings for `testTimeout` placement in project configs.
- Complete Wave 1 tooling repair: React test renderer alignment, portable quality script, Prettier config cleanup, and focused gate scripts.
- Retire remaining domain server-state context bridges from `AppProviders` in domain-sized slices.
- Move domain database/service ownership from root `src/services` into `src/features/{domain}`.
- Continue screen module decomposition until no implementation file in `src/screens` or `src/screenModules` exceeds 400 lines.
- Burn down type-aware ESLint errors from the Phase 8 baseline of 3,191 errors across 247 files.

### Blockers/Concerns

- `npm run lint` still fails on broad existing lint debt across tests, screens, and components after the parser config was repaired.
- `src/screens` wrappers hide implementation complexity in `src/screenModules`; Phase 8 treats both as cleanup surfaces.
- The worktree was already dirty before Phase 8 started; preserve unrelated changes and stage only specific files.

## Session Continuity

Last session: 2026-05-09
Stopped at: Phase 8 baseline captured; Wave 1 and first cleanup slices in progress
Resume file: `.planning/phases/08-clean-structure-hardening/08-PLAN.md`
