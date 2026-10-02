# App Architecture and Feature Integration Remediation Plan

Status date: 2026-09-03

## 1. Outcome

The application layer now has a single cloud-backed authority for each financial domain, a shared
transaction interpretation model, atomic payment-to-ledger commands, wallet balance
synchronization, and feature controls at both navigation and mutation boundaries. A live Supabase
audit found that the deployed backend is not yet compatible with that target: its migration ledger
is behind its actual schema, legacy entity IDs remain `text`, several privileged functions are
anonymous-callable, and two Edge Functions require immediate containment. The next work is
therefore backend security and migration reconciliation, not direct deployment of the current
September migration sequence.

This plan records the audit findings, the implemented remediation, and the proof required before
release. A phase is only release-complete when its local and environment gates both pass.

Containment update (2026-09-03): the unauthenticated DDL function and the unsafe custom
entitlement function have been deleted from the hosted project; anonymous execution was removed
from the identified financial RPCs; group-membership, invite, profile-override, and transaction
transition boundaries have been tightened through three live migrations. The custom offline
entitlement fallback was removed from the app because it did not have a server-verified RevenueCat
authority. RevenueCat is now the sole Pro authority until a verified webhook/backend authority is
designed. Payment nudges are intentionally unavailable until their server-side debt contract exists.

## 1.1 Live Supabase audit snapshot

Audit target: hosted project `BuddyIO` (`hpegizfqwwloutgvdcsd`), inspected read-only on
2026-09-03 through the connected Supabase project tools.

- Project health: `ACTIVE_HEALTHY`, PostgreSQL 17.
- Recorded migration history ends at `20260829131625_rebuild_budget_plan_model`; none of the local
  `20260902*` migrations are recorded.
- The live schema nevertheless contains untracked September-era objects including `wallets`,
  transaction linkage columns, consolidated group-ledger fields, and early loan/savings RPCs.
- Live `groups`, `transactions`, loans, subscriptions, savings goals and their foreign keys use
  `text` identifiers. All five existing group IDs and all five existing transaction IDs are
  non-UUID values, so they cannot be converted with a direct cast.
- The current local migrations declare UUID parameters and foreign keys against those text-keyed
  tables. Several functions would fail at runtime or create ambiguous text/UUID overloads if that
  sequence were applied unchanged.
- RLS is enabled on every audited feature table, but policy authority is too broad for membership
  updates and transaction ownership changes. The expected owner-preservation and wallet-balance
  triggers are absent.
- Supabase security advisors report 58 warnings: 17 callable `SECURITY DEFINER` exposures across
  anonymous/authenticated roles, 21 GraphQL table-exposure notices, 19 anonymous-sign-in policy
  notices, and leaked-password protection disabled. GraphQL visibility is not automatically a
  data leak when RLS is correct, so those notices require policy-specific triage rather than bulk
  revocation.
- Performance advisors report 29 unused indexes. The database is small and newly changed, so this
  is observation-only until representative workloads exist.
- Recent 24-hour Edge Function logs show entitlement and FX-rate requests but no visible
  `execute-migration` invocation. This short log window is not evidence that it was never invoked.

## 2. Target architecture

```text
Screen / route
  -> feature route gate
  -> domain hook or mounted context
  -> exact action guard
  -> one domain service
  -> Supabase table or atomic RPC
  -> canonical transaction ledger
  -> shared read models
  -> Home / Budget / Analytics / Net Worth / Notifications
```

Ownership rules:

1. React Query and the mounted domain contexts own client server-state caching.
2. Supabase owns persisted financial records; AsyncStorage and other local services are not
   competing financial authorities.
3. A domain payment and its corresponding transaction are one database command.
4. `transactions` is the common ledger. Feature records link to it through UUID foreign keys.
5. Wallet balances are projections maintained from wallet-linked ledger mutations.
6. Shared transaction read models own split, settlement, income and expense semantics.
7. Feature dependencies describe hard runtime requirements only. Optional sibling features do not
   disable aggregate shells.

## 3. Findings and disposition

| ID  | Finding                                                                                                                                                   | Risk                                                                                                                                 | Remediation                                                                                                                                                                                                     | Current status                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| A01 | The canonical schema and migrations disagreed on UUIDs, group columns and supporting tables.                                                              | Clean deployments could fail or differ from upgraded environments.                                                                   | Normalize UUID contracts; define group invites, activity, feature controls, wallets and linkage fields; make migrations tolerate missing legacy group-ledger tables.                                            | Implemented locally; deployment proof pending.               |
| A02 | Group-member insert, update and delete policies allowed members to mutate membership authority too broadly.                                               | A member could add, alter or remove other membership rows.                                                                           | Restrict inserts and updates to the group creator, allow deletes only for the creator or the row's own authenticated user, revoke direct invite updates, and accept invites through an identity-bound RPC.      | Implemented locally; two-user RLS proof pending.             |
| A03 | Loans, subscriptions and savings had local or duplicate persistence authorities.                                                                          | Reloads, devices and reports could disagree.                                                                                         | Route mounted providers through the Supabase services and remove obsolete local storage/services and unused database analytics authority.                                                                       | Implemented and type-checked.                                |
| A04 | Domain payments and ledger writes were separate operations.                                                                                               | Partial failure could record a payment without an expense, or duplicate an expense on retry.                                         | Add idempotent atomic RPCs for loan payments, savings deposits and subscription payment create/update/delete operations.                                                                                        | Implemented locally; deployed transaction proof pending.     |
| A05 | Transactions could reference wallets without a universal balance update rule; wallet initialization could write while read-only.                          | Wallet balances could drift, and feature controls could be bypassed by a read query.                                                 | Add a wallet ownership-checking balance trigger, invalidate wallet queries after linked mutations, gate default seeding with `wallets.create`, and make default seeding concurrency-safe.                       | Implemented locally; trigger proof pending.                  |
| A06 | Home, Budget, Analytics and transaction summaries used different amount semantics for group splits and settlements.                                       | The same activity could produce different totals or be double counted.                                                               | Centralize the user's economic share, exclude settlements from spending, and consume the shared model across all reporting surfaces.                                                                            | Implemented with focused unit coverage.                      |
| A07 | Feature controls covered routes unevenly, allowed optional modules to cascade-disable parent shells, and had some missing mutation assertions.            | Disabled/read-only features could still write, while unrelated screens could be blocked.                                             | Propagate only true hard dependencies, enforce action guards in mounted providers and batch commands, support create-or-update route alternatives, and add source-connected matrix checks.                      | Implemented; runtime override walkthrough pending.           |
| A08 | Investment queries reused portfolio keys for different resources.                                                                                         | Cache collisions could return the wrong resource shape.                                                                              | Give investments and portfolios distinct query-key families and invalidate the correct keys.                                                                                                                    | Implemented and type-checked.                                |
| A09 | Automatic loan/subscription processing could create duplicate ledger entries or mark work processed after a failed record.                                | Retries could overstate expenses or suppress required retries.                                                                       | Use stable operation keys, let atomic RPCs own ledger creation, and fail the automation command when recording fails.                                                                                           | Implemented; clock/retry integration proof pending.          |
| A10 | Add/edit route logic was oversized and date mapping was lossy; group invite routing named the dynamic token incorrectly.                                  | Editing could reset dates, and valid invite links could be rejected.                                                                 | Extract pure loan route mappers, add mapping tests, reduce the route shell, and rename/read the invite parameter as `token`.                                                                                    | Implemented with focused tests.                              |
| A11 | Notification initialization used mixed data sources.                                                                                                      | Reminders could be scheduled from stale records.                                                                                     | Feed initialization from the same mounted loan and subscription providers used by the screens.                                                                                                                  | Implemented; notification permission/device proof pending.   |
| A12 | Dead generic mutation wrappers and obsolete services obscured production ownership.                                                                       | Future changes could target code that no runtime path used.                                                                          | Remove unused mutation modules, local loan/subscription authorities, credit-card remnants in the retired surface, and the unused progressive loader.                                                            | Implemented; final dead-import scan required.                |
| A13 | The hosted migration ledger stops in August while the schema contains untracked September objects.                                                        | A normal migration push cannot reliably determine what has already run and may fail halfway.                                         | Snapshot the project, inventory every untracked object, create a reconciliation baseline, and prove a dry run on an isolated branch/staging project before touching the hosted project.                         | Confirmed live; reconciliation not started.                  |
| A14 | Live domain and group IDs are text, including non-UUID data, while the local target migrations assume UUID.                                               | New RPCs and policies can fail, overload ambiguously, or bind to the wrong signature.                                                | Choose and document the canonical ID contract; because the app now generates UUIDs, build an explicit remap migration for legacy IDs and every FK, or retain text consistently. Never rely on direct casts.     | Confirmed live; blocking deployment.                         |
| A15 | Five user-scoped `SECURITY DEFINER` functions were executable by `anon`/`PUBLIC` and permitted a null `auth.uid()` to bypass ownership.                   | Anyone with the public project key could read financial summaries or mutate budgets, loans, savings and wallets for a known user ID. | Anonymous/public execution was revoked live. Add anon/owner/different-user RPC integration tests and simplify/reconcile obsolete overloads before release.                                                      | Contained live; behavioral proof pending.                    |
| A16 | The public `execute-migration` Edge Function had JWT verification disabled and opened a direct DB connection to run DDL.                                  | Any caller could trigger privileged schema changes; it also bypassed migration history.                                              | The function was deleted live and its stale local function configuration removed. Rotate the direct DB credential only if it was independently provisioned outside the deleted function.                        | Contained live; credential provenance pending.               |
| A17 | `get-secure-entitlements` embedded a fallback private signing key and issued 30-day tokens from a writable profile override.                              | A user could forge or self-mint premium entitlement state; valid RevenueCat purchases could also be downgraded offline.              | The signing key was rotated, then the custom function, client verifier, token cache, and profile override write path were removed. Build a RevenueCat webhook/backend authority before restoring server tokens. | Contained live; verified authority is a planned replacement. |
| A18 | `nudge-member` authenticated the caller but did not prove group membership, debt relationship, or permission to contact the target user.                  | Any account could send arbitrary payment-reminder push content to another known user ID.                                             | The deployed function now fails closed. Validate both users and the debt in one server-side command, derive copy from persisted data, and rate-limit before re-enabling.                                        | Contained live; feature intentionally unavailable.           |
| A19 | Broad table grants included `TRUNCATE`, `TRIGGER` and `REFERENCES` for `authenticated`; live membership/update policies were wider than the local design. | RLS does not protect every table-level operation, and future database code can amplify excessive privileges.                         | Excess non-CRUD grants were revoked; group member mutation is owner-only, invite acceptance is an identity-bound RPC, profile overrides are server-only, and transaction writes require group membership.       | Contained live; two-user RLS proof pending.                  |
| A20 | The wallet balance trigger, subscription payment RPCs and atomic invite-acceptance RPC are absent from the hosted database.                               | Generic transactions can drift from wallet balances, and cross-feature operations remain partially atomic.                           | Deploy only after A13-A19 are resolved, then prove rollback, idempotency, ownership and balance deltas against the reconciled schema.                                                                           | Confirmed live; feature integration incomplete.              |

## 4. Phase plan and gates

### Phase -1 - Immediate hosted-backend containment

Deliverables:

- Disable or remove the unauthenticated `execute-migration` Edge Function without invoking it.
- Revoke `PUBLIC` and `anon` execution from every privileged financial RPC.
- Require `auth.uid()` to be non-null and equal to the requested user inside all user-scoped
  privileged functions.
- Rotate the exposed entitlement signing key, remove the fallback key from source, and version or
  invalidate previously issued entitlement tokens.
- Constrain `nudge-member` to an authenticated, persisted group/debt relationship.
- Enable leaked-password protection and either disable anonymous sign-ins or explicitly exclude
  anonymous users from sensitive policies.

Exit gate:

- Anonymous calls to every privileged RPC and migration function return authorization failure.
- A different authenticated user cannot read or mutate another user's financial state.
- Tokens signed with the retired entitlement key are rejected.
- No Edge Function source contains a private key or direct unauthenticated DDL path.

Status: containment migrations `20260903102221`, `20260903113000`, and `20260903114500` are
applied live. The deleted Edge Functions and anonymous RPC grants were verified absent. Remaining
release blockers are leaked-password protection, anonymous-auth policy posture, two-user RLS/RPC
tests, and the server-owned RevenueCat authority needed for any custom entitlement token.

### Phase -0.5 - Schema and migration reconciliation

Deliverables:

- Snapshot the hosted project and export schema-only metadata.
- Diff actual objects against both recorded migration history and local migration files.
- Decide the canonical entity-ID contract. If UUID remains the target, generate deterministic UUID
  replacements for the five legacy groups, five transactions and all dependent FKs in one tested
  transition; do not cast the existing non-UUID text values.
- Remove obsolete text/UUID function overloads and regenerate database TypeScript types only after
  the transition.
- Create a clean reconciliation migration/baseline so every live object has exactly one recorded
  owner and future environments reproduce the same schema.
- Validate the entire sequence on an isolated Supabase branch or disposable staging project.

Exit gate:

- A clean database and the reconciled hosted snapshot converge to the same schema.
- Migration history accurately represents every deployed object.
- No RPC overload ambiguity remains and every FK type matches its referenced key.
- All current test data survives or is intentionally reset under an approved non-production data
  decision.

Status: blocking; current `20260902*` files must not be deployed unchanged.

### Phase 0 - Baseline and ownership map

Deliverables:

- Inventory routes, mounted providers, query keys, services, tables, RPCs and background workers.
- Identify each feature's authoritative write path and all downstream consumers.
- Record dirty-worktree boundaries before editing.

Exit gate:

- Every financial feature has one named client owner and one named persisted owner.
- Existing unrelated worktree changes remain untouched.

Status: complete.

### Phase 1 - Database contracts and RLS

Deliverables:

- Normalize UUID foreign keys for loans, subscriptions, groups, wallets and transactions.
- Add missing canonical tables/columns and covering indexes.
- Restrict public schema creation and anonymous table/function access.
- Bind invite acceptance to the authenticated user's email in one locked transaction.
- Restrict direct membership authority to group owners, except self-removal.

Local gate:

- Schema contains no policy references to undefined tables or columns.
- Migration order is deterministic and each new RPC explicitly revokes public/anonymous execution.
- SQL files pass parser/lint checks when a local Supabase database is available.

Environment gate:

- Apply migrations in a staging project.
- Prove owner, accepted member, invited non-member and unrelated-user access independently.
- Confirm an invite cannot be accepted by a different authenticated email.

Status: local implementation exists, but the live audit found blocking type, policy and migration
drift. Phase -1 and Phase -0.5 must complete first.

### Phase 2 - Canonical domain persistence

Deliverables:

- Loans use `LoanDatabaseService` through `LoanProvider`.
- Subscriptions use `SubscriptionDatabaseService` through `SubscriptionProvider`.
- Savings and wallets use their Supabase services and React Query keys.
- Remove stale AsyncStorage/local service ownership for these domains.

Exit gate:

- Create, edit, delete and reload return the same record.
- A second authenticated device observes the same records after invalidation/refetch.
- No mounted screen imports a removed persistence authority.

Status: implementation complete; second-device proof pending.

### Phase 3 - Atomic cross-feature commands

Deliverables:

- Loan payment updates the loan, writes payment history and creates one linked transaction.
- Subscription payment create/update/delete stays synchronized with its linked transaction.
- Savings deposit updates the goal and writes one linked transaction.
- All three accept stable operation keys for retry safety.
- Wallet ownership is checked inside the database command.

Exit gate:

- Retrying the same operation key creates no duplicate payment or transaction.
- A forced error rolls back every part of the command.
- Editing/deleting a subscription payment edits/deletes the linked ledger row.
- Feature and wallet caches invalidate after success.

Status: implementation and service-contract tests complete; database rollback/idempotency proof pending.

### Phase 4 - Shared financial read models

Deliverables:

- Define personal income/expense behavior.
- Define payer, participant and non-participant shares for group expenses.
- Exclude settlements from spending totals while preserving settlement history.
- Reuse the model in Home, Budget, Analytics and transaction summaries/charts.

Exit gate:

- The same fixture produces identical spending totals on every consuming surface.
- Group payer and participant fixtures cover equal and custom splits.
- Settlements never inflate expense totals.

Status: complete with focused unit tests.

### Phase 5 - Feature controls and navigation

Deliverables:

- Cover every Expo route.
- Guard each mounted provider's writes and direct batch commands.
- Stop reads when the feature cannot be read.
- Model only hard feature dependencies.
- Treat shared add/edit screens as create-or-update routes; enforce the exact action on submit.
- Keep the mutation inventory connected to real source symbols and action guards.

Exit gate:

- Hidden/disabled/maintenance features cannot be opened or mutated.
- Read-only features remain visible but reject writes.
- An action override cannot reopen a hard-blocked feature.
- Disabling Savings does not disable Trackers, Wallets or Analytics.

Status: implementation and resolver/matrix tests complete; remote-control runtime walkthrough pending.

### Phase 6 - Automation, notifications and cache coherence

Deliverables:

- Auto-transactions call the domain command once with stable idempotency keys.
- Failed commands remain retryable.
- Notification initialization reads the canonical mounted providers.
- Separate resource shapes use separate query keys.
- All cross-feature commands invalidate their dependent query families.

Exit gate:

- Two automation runs for the same due item create one ledger transaction.
- A simulated failure retries on the next run.
- Reminder schedules match the current persisted due dates.
- Investment category, investment and portfolio caches cannot collide.

Status: implementation complete; scheduled runtime proof pending.

### Phase 7 - Route decomposition and dead-code removal

Deliverables:

- Keep Expo route files as thin screen-module adapters.
- Move form mapping and orchestration to feature hooks/pure mappers.
- Remove unused mutation modules and competing services.
- Remove imports/exports that reference deleted modules.

Exit gate:

- TypeScript and route-shell tests pass.
- Repository search finds no import of a deleted authority.
- The loan mapper preserves start, first EMI and charge fields.
- Invite deep links expose the dynamic value as `token`.

Status: complete. Final dead-import search and navigation-boundary tests pass.

### Phase 8 - Verification, deployment and release

Local verification order:

1. Format changed TypeScript/TSX files.
2. Run focused unit and integration suites for shared totals, controls, payment services, wallets,
   invite acceptance and route mapping.
3. Run `npx tsc --noEmit`.
4. Run scoped ESLint, then the repository quality gate.
5. Run `git diff --check`.
6. Build the warm arm64 Android debug target without cleaning caches.

Staging verification order (after Phase -1 and Phase -0.5):

1. Back up or snapshot the staging database.
2. Apply the reconciled migration sequence from a clean baseline; do not apply the current
   `20260902*` files unchanged.
3. Run SQL/RLS tests with at least two authenticated users.
4. Exercise each atomic payment twice with the same operation key.
5. Verify wallet balance deltas for transaction insert, wallet reassignment, amount/type edit and
   delete.
6. Verify offline-to-online refetch and a second-device refresh.
7. Exercise feature status and action overrides from the remote configuration.
8. Run Android create/edit/reload journeys for every financial domain.

Release gate:

- All local gates pass.
- Staging migrations apply without manual repair.
- RLS negative tests fail safely.
- Atomic retry and rollback checks pass.
- Android journeys and notification permissions pass on a physical device or release-equivalent
  emulator.
- Any environment-only limitation is recorded explicitly; static proof is not presented as native
  or deployed proof.

Status: local application verification complete. Hosted security containment, migration
reconciliation, staging database proof and connected-device proof remain pending.

### Local verification evidence

- `npm run test:unit -- --runInBand`: 104 suites and 454 tests passed.
- Focused cross-feature set: 14 suites and 55 tests passed.
- `npm run lint:all`: passed with 0 errors. The repository still reports non-blocking warnings.
- `npm run format:check`: passed.
- `npx tsc --noEmit`: passed after the final route and wallet changes.
- `git diff --check`: passed; Git reports only Windows line-ending conversion notices.
- Android `app:assembleDebug` for `arm64-v8a`: passed in 4m58s. This run started a daemon and
  rebuilt/cache-restored native artifacts, so it is not evidence for the warm 36-second baseline.
- `adb devices -l`: no connected device, so no interactive Android journey was claimed.
- `supabase db lint --local`: could not connect because no local Postgres/Supabase instance was
  running. SQL parser, deployed migration, RPC rollback and RLS proof therefore remain pending.

## 5. Migration rollout order

Apply the 2026-09-02 migrations in filename order. The required sequence is:

1. Transaction linkage fields.
2. Global category model.
3. Security and RLS hardening.
4. Credit-card table retirement.
5. Wallet table creation.
6. Unified transaction/group ledger.
7. Atomic loan and savings commands.
8. Investment-category foreign-key correction.
9. Savings recurrence and retirement fields.
10. Wallet balance trigger.
11. Atomic subscription commands.
12. Atomic invite acceptance.

Do not deploy only the later RPC files: they depend on the normalized columns, indexes and grants
introduced earlier in the sequence.

## 6. Proof matrix

| Workflow                         | Local unit/static proof                | Staging database proof                | Android proof                           |
| -------------------------------- | -------------------------------------- | ------------------------------------- | --------------------------------------- |
| Personal transaction with wallet | Mapping, service and type checks       | Trigger delta and ownership rejection | Create/edit/delete and visible balance  |
| Group expense and settlement     | Shared amount fixtures                 | Member RLS and ledger access          | Multi-user group flow                   |
| Loan payment                     | RPC payload and mapper tests           | Atomic rollback and retry             | Record payment and reload               |
| Subscription payment             | Create/update/delete RPC payload tests | Linked ledger synchronization         | Manual and automatic payment flow       |
| Savings deposit                  | RPC payload tests                      | Atomic goal/ledger/wallet delta       | Deposit and progress refresh            |
| Feature controls                 | Resolver, route and inventory tests    | Remote row refresh                    | Hidden/read-only/dependency walkthrough |
| Invite acceptance                | Route and RPC service tests            | Email-bound two-user RLS test         | Deep-link login and redirect            |
| Home/Budget/Analytics totals     | Shared fixture tests                   | Representative cloud fixture          | Cross-screen visual comparison          |

## 7. Definition of done

The remediation is done when the app has no competing runtime authority for the covered domains,
all cross-domain money movements are atomic and idempotent, all reporting surfaces agree on the
same transaction meaning, feature controls prevent both navigation and writes without unnecessary
cascade blocking, and the deployed schema plus Android journeys have been verified. Until staging
and Android evidence exists, the code is locally complete but not release-proven.
