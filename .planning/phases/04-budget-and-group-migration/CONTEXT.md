---
phase: 04-budget-and-group-migration
---

## Objective

Budget and Group contexts already migrated to TanStack Query (Phase 3). Complete remaining Phase 4 tasks:

- Add Supabase realtime subscriptions for groups
- Integration testing for cross-entity cache invalidation

---

## Scope

**In Scope (from Phase 3):**

- BudgetQueryProvider ✓
- EnhancedGroupQueryProvider ✓
- GroupRealtimeService (real-time group expense subscriptions)

**Out of Scope (infrastructure layers):**

- SettingsContext (AsyncStorage preferences)
- ToastContext (UI notifications)
- CoordinationContext (event bus)
- EnhancedAuthContext (authentication)
- FinancialAnalyticsContext (derived data consumer)

---

## Context

Budget and Group contexts are now TanStack Query-based with real-time capabilities. Phase 4 focuses on:

1. **Real-time group expense subscriptions** - Enable all group members to see expense changes instantly
2. **Integration verification** - Ensure cross-entity cache invalidation works correctly
3. **Phase 5 readiness** - Screen decomposition and UI optimization

---

## Tasks

| Task  | Status     | Description                                            |
| ----- | ---------- | ------------------------------------------------------ |
| 04-01 | ✅ DONE    | Add GroupRealtimeService                               |
| 04-02 | ⏭ SKIPPED | Migrate EnhancedGroupContext                           |
| 04-03 | ✅ DONE    | Integration test cross-entity invalidation             |
| 04-04 | 🔄 TODO    | Add Supabase realtime subscriptions                    |
| 04-05 | 📋 TODO    | Convert FinancialAnalyticsContext to derived hook      |
| 04-06 | 📋 TODO    | Delete CoordinationContext and migrate consumers       |
| 04-07 | 📋 TODO    | Decompose SupabaseDatabaseService into domain services |
| 04-08 | 📋 TODO    | Reorganize into feature-first directory structure      |
| 04-09 | 📋 TODO    | Reduce provider tree to ~5 levels                      |

---

## Dependencies

**Depends on:** Phase 3 (all data contexts migrated)

**Required:** None from ROADMAP (can proceed)

---

## Success Criteria

- [x] Integration tests written and passing
- [ ] Supabase realtime subscriptions added
- [ ] Cross-entity invalidation verified in testing
- [ ] TypeScript compiles
- [ ] Lint passes

---

## Risk Assessment

- **Low Risk**: Task 04-03 is adding tests only
- **Medium Risk**: Task 04-04 requires implementing Supabase realtime feature

---

## Expected Impact

- Real-time group expense updates across all members
- Verified cross-entity cache invalidation patterns
- Foundation for Phase 5 (Screen Decomposition)

---

## Notes

Task 04-02 (Migrate EnhancedGroupContext) was already complete in Phase 2, marked as skipped.
Integration tests provide verification that existing cross-entity invalidation patterns work correctly.
