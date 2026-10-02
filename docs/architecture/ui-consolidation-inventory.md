# UI Consolidation Inventory

Last refreshed: 2026-08-22

## Authoritative program tracker

This section is the current delivery tracker. Historical phase notes below are retained as context,
but do **not** override this matrix.

### Program rule

`GlassSurface` is the only ordinary elevated-card surface. `GlassBackdrop` remains only where
an overlay or shaped effect needs the screen blur target. A feature owns its domain layout,
content, and interaction semantics—not a new blur, gradient, border, shadow, or card API.

### Retirement batches

| Batch | Scope                                                 | Migration target                                                                      | Legacy retirement                                                        | Status   | Required proof before retirement                                                        |
| ----- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------- |
| 0     | Reachability, inventory, surface contract             | `GlassSurface` with neutral default, semantic `washColor`, `fill`, and `contentStyle` | Unreachable components, `GlassCard`, `HomeFormCard`                      | Complete | Source reachability and focused contract tests                                          |
| 1     | Transactions, analytics, wallets, investment research | Package `GlassSurface`, `MetricCard`, and mobile shell primitives                     | App-local portable wrappers                                              | Complete | Package contracts, unit suite, and Android assembly                                     |
| 2     | Groups and group transactions                         | Package surfaces, forms, actions, and overlays                                        | App-local sheet, dialog, and portable component wrappers                 | Complete | Package contracts, unit suite, and Android assembly                                     |
| 3     | Budgets, loans, savings                               | Package surfaces, metrics, forms, feedback, and actions                               | Legacy surfaces and forwarding barrels                                   | Complete | Package contracts, unit suite, and Android assembly                                     |
| 4     | Settings, auth, membership, onboarding                | Package surfaces, content, feedback, overlays, and feature-owned orchestration        | Portable app wrappers and mislocated domain components                   | Complete | Package contracts, auth coverage, and Android assembly                                  |
| 5     | Package/repository finalization                       | Compiled `@ravitamil/buddy-ui` plus app-only composites and feature-owned domain UI   | Compatibility exports, unreachable barrels, and obsolete implementations | Complete | Zero unreachable files, package publication checks, packed consumer, and CI definitions |

### Completion gates for every batch

1. Add/update surface-contract tests for neutral, semantic wash, fill, content layout, themes, and accessibility.
2. Run `npm run audit:components:check`, focused tests, `cmd /c npx tsc --noEmit`, focused ESLint,
   `npm run format:check`, and `git diff --check`.
3. Run an Android arm64 debug assembly and keep iOS simulator compilation in macOS CI. Live device
   interaction is a separate application-release activity and was intentionally excluded from this program.
4. Delete a legacy implementation only after the audit reports no production, route, test, or story reach.

## Live reachability audit

`npm run audit:components -- --markdown` is the source of truth for the classification of every
component under `src/components/**`, `src/features/**/components/**`, and the app UI package. It
resolves relative and `@/` imports, named/default barrel exports, dynamic imports/requires, Expo
route consumers, and native/web implementation siblings. It prints one classification per component
with reach evidence, so the inventory cannot drift through a manually copied file list.
`npm run audit:components:check` fails when a component is unreachable.

The 2026-08-22 final audit classifies all 343 component files as active through application reach or
a declared package entrypoint. None are test-only, story-only, or unreachable. `PhoneAuthButton` is
now rendered by `AuthenticationScreen` when its feature action is enabled. Deletions were limited to
files proven unreachable after resolving aliases, barrels, routes, dynamic imports, package exports,
tests, stories, and platform siblings.

### Card and surface review matrix

`GlassSurface` is the canonical default for neutral elevated cards. Its contract includes only
theme-owned Fluid Surface chrome, semantic `washColor`, `fill`, `contentStyle`, test IDs, and a
background adornment. It intentionally rejects consumer-defined intensity, gradients, borders,
tones, and shadows.

| Classification                        | Active wrappers / surface owners                                                                                                                                                                                                                                                                                                                                                                                                                     | Contract and next action                                                                                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct `GlassSurface` composition     | `AnalyticsGlassCard`, `BudgetGlassCard`, `BudgetAnalyticsCard`, `CategoryBudgetGlassCard`, `CreditCardFormGlassCard`, `EditGroupGlassCard`, `FindGroupGlassCard`, `LoanGlassCard`, `ManageCategoryGlassCard`, `PortfolioGlassCard`, `PrivacyGlassCard`, `TransactionDetailGlassCard`, `AddTransactionCard`, plus the feature sections in analytics, cards, categories, groups, loans, membership, savings, settings, transactions, wallets, and auth | These use the canonical surface for ordinary card chrome. Feature components retain content, press semantics, and layout only.                                              |
| Feature-owned specialized composition | Animated credit-card faces, plan badges/accent artwork, chart/metric content, icon containers, transaction and group row layout                                                                                                                                                                                                                                                                                                                      | These retain domain presentation only; they do not own general Fluid Surface blur, gradient, border, radius, or shadow recipes.                                             |
| Overlay or modal primitive            | Package `GlassBackdrop`, `Dialog`, `ConfirmationDialog`, `BottomSheet`, `BottomSheetAction`, `BottomSheetOption`, and `DatePickerSheet`                                                                                                                                                                                                                                                                                                              | Retain in the package. These own blur-target, dialog, sheet, or shaped transient behavior rather than ordinary content-card treatment. Dialog sheet adaptation is internal. |
| Retired in Batch 5                    | App-local surface, sheet, dialog, toggle, Lottie, form, action, metric, and forwarding wrappers                                                                                                                                                                                                                                                                                                                                                      | Deleted after source reachability showed no direct consumer; no deprecated re-export or compatibility shim remains.                                                         |

The final direct-`Card` source review leaves only deliberately specialized elements: profile media,
small icon frames/badges, an anonymous-auth animation element, and the transparent layout envelope
inside `SettingsItem`. The ordinary Home empty state, active-notification row, and savings-portfolio
empty state were moved to `GlassSurface` in this final sweep.

The post-review migration has source-contract coverage for the canonical surface and legacy
retirement. The program's requested proof is complete without connected-device interaction; no
compatibility re-export is allowed.

## Objective

Restore a coherent BuddyIO design after the Tamagui migration by consolidating components that
serve the same product role but currently apply different spacing, typography, elevation, color,
or interaction behavior.

The intended direction is a calm financial interface with app-owned typography, one configurable
brand accent, restrained semantic colors, warm neutral surfaces, and a small number of deliberate
surface levels. BuddyIO uses SF Pro, emerald, and Smokey Fog Black; future apps can change their
brand and font without forking the component contracts. The canonical treatment is the
semi-translucent Fluid Surface system documented in `docs/fluid-surface-design-system.md`. Fluid
Surface is reserved for elevated or visually grouped content rather than applied to every container.

## Ownership Rules

- `packages/buddy-ui` owns package-safe foundations, themes, primitives, and universal composites
  such as `Button`, `Card`, `Input`, `FormField`, and `Text`.
- `src/components/ui` owns BuddyIO-only composites such as navigation chrome, profile orchestration,
  toast integration, and the product screen background. It does not re-export package primitives.
- `src/features/<feature>/components` owns finance-domain content, but it must compose shared visual
  primitives instead of recreating their borders, shadows, blur, spacing, or state behavior.
- Compatibility wrappers are retired; new package primitives are consumed directly.
- Shared component defaults are part of the visual contract. Moving a component must not silently
  change its height, padding, typography, focus behavior, elevation, or child layout.

## Live Candidate Matrix

Reference counts are file-level matches from the live tree. They include the defining file and are
used to estimate blast radius rather than as an exact runtime count.

| Priority | Family                      | Current candidates                                                                     |                   Live reach | Canonical target                                                                          | Status                                            |
| -------- | --------------------------- | -------------------------------------------------------------------------------------- | ---------------------------: | ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| P0       | Surfaces                    | Package `GlassSurface`, `GlassBackdrop`, solid `Card`, and domain compositions         |          App-wide references | `GlassSurface` for neutral cards; `GlassBackdrop` only for specialized compositions       | Complete; Android assembly passed                 |
| P0       | Forms                       | Package `Input` and `FormField`                                                        | All labelled-field consumers | Package `Input` primitive and package `FormField` composite                               | Complete; legacy form composites deleted          |
| P1       | Floating and action buttons | `Button`, `IconAction`, and `FloatingAction`                                           |             App-wide actions | `Button`, `IconAction`, and variant-driven `FloatingAction`                               | Complete; four legacy action components deleted   |
| P1       | Bottom sheets               | `AppBottomSheet`, `AppAdaptSheet`, and `BottomSheetOption`                             |      All direct sheet chrome | Shared app sheet chrome with feature-owned content                                        | Complete; direct `Sheet` ownership is centralized |
| P1       | Metric cards                | `Card` and `MetricCard`                                                                |     14 metric-card instances | `Card` plus `MetricCard` with tone, trend, progress, density, and pressability            | Complete; both legacy stat cards deleted          |
| P2       | Screen shells               | Public `ScreenContainer` and `ScreenWrapper`; internal safe-area and keyboard adapters |       App-wide screen shells | One documented composition path with background, safe-area, scrolling, and keyboard modes | Complete; public shell path documented            |

## Next-wave component consolidation matrix

These are the remaining high-confidence consolidation candidates after the surface retirement.
They are intentionally grouped by shared behavior rather than by filenames: finance-domain text,
navigation, callbacks, and data ownership stay in their features.

| Priority | Repeated contract                                                            | Current owners                                                                                                                                                    | Proposed shared owner            | Migration boundary                                                                                                                                                                                                                                                                                                           |
| -------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Small coloured icon tile/frame, optional badge, fixed accessible size        | `SettingsItem`, `NotificationSettingsRows`, `PrivacySecurityCards`, `HelpSupportShared`, `ProfileSecuritySections`, `ProfileSettingsShared`, `SettingsDangerZone` | `@ravitamil/buddy-ui/IconTile`   | **Complete in source.** `IconTile` owns solid/soft frame treatment, optional badge, and icon sizing. Features retain press action, labels, switches, chevrons, and form semantics.                                                                                                                                           |
| P1       | Empty/loading-state layout with artwork, title, body, and optional action    | Budget, Groups, Home, Loans, Savings, Settings, and Subscriptions state components                                                                                | `@ravitamil/buddy-ui/EmptyState` | **Complete in source.** Package `EmptyState` owns reusable icon/action/text anatomy. Domain copy, actions, retry logic, list placement, and loading timing remain feature-owned.                                                                                                                                             |
| P1       | Compact quick-action grid/row with icon, label, disabled/loading/press state | `QuickActionPanel`, Home quick actions, Savings quick actions, loan-detail and subscription quick actions                                                         | `@ravitamil/buddy-ui/ActionGrid` | **Complete in source.** Package `ActionGrid` serves Savings Goal, Loan Detail, and Subscription Detail. Home navigation remains feature-owned while package primitives own reusable layout and action state.                                                                                                                 |
| P2       | Feature list/detail-row anatomy                                              | Transaction, Group, Loan, Subscription, and Settings rows                                                                                                         | No extraction in this phase      | **Audited; retain feature-owned.** Transaction rows carry recurrence/settlement state, loans add repayment actions and progress, subscriptions add renewal/site status, and detail rows intentionally differ in semantic colour and separators. A universal row API would conceal, rather than consolidate, those contracts. |

Package `BottomSheet`/`BottomSheetAction`/`BottomSheetOption`, `Dialog`/`ConfirmationDialog`,
`FormField`/`Input`,
`Button`/`IconAction`/`FloatingAction`, `MetricCard`, and mobile screen primitives are the canonical
contracts. New work must import them directly from `@ravitamil/buddy-ui` rather than creating an
app forwarding wrapper. Future extraction needs an import/reachability matrix, a focused contract
test, focused migration, and static/platform compile gates before old implementations are deleted.

## Phase 1: Surface Consolidation

### Current State

`GlassSurface` is the single ordinary elevated-card contract. It owns theme-driven Fluid Surface
fill, edge, radius, depth, optional semantic wash, generic `fill`, and `contentStyle`. It has no
consumer-controlled intensity, custom gradient, custom border, tone, or shadow API.

The app-local `GlassSurface`, `GlassmorphismContainer`, and `GlassmorphismCard` implementations
have been deleted with their compatibility exports. Package `GlassSurface` is the canonical owner;
package `GlassBackdrop` remains the low-level blur layer for overlays, modal layers, and exceptional
shaped effects. A source scan finds no feature or screen direct owner of `expo-blur`.

## Phase 2: Form Consolidation

### Completed

- Added package-level `FormField` with label/input association, required state, error, warning,
  help copy, character count, icon support, and multiline Android alignment.
- Migrated every `ValidatedInput` and `StandardFormField` consumer to the package field.
- Added focused contract tests for message priority, association, and character count.
- Standardized package buttons and inputs on 48-point regular and 56-point large touch targets.

### Add Transaction Slice Completed

- Replaced the form-specific blur/gradient recipe with the canonical `GlassSurface`, preserving
  real native blur, a translucent gradient, edge refraction, and theme-aware depth without
  duplicating the visual treatment inside the transaction feature.
- Replaced duplicated transaction, category, and recurrence selections with one theme-driven choice
  treatment using brand color for ordinary selection and semantic color only for income/expense.
- Migrated amount and description entry to the package `FormField` contract.
- Added a shared date-field presentation for transaction and recurrence dates.
- Replaced the overlapping circular save control with a full-width, safe-area-separated bottom
  action bar using the package `Button` loading and disabled contracts.
- Removed raw light/dark branches, transaction gradient plumbing, and the obsolete React Native
  `StyleSheet` recipe from the flow.
- Replaced recurrence-frequency chips with a controlled, accessible bottom-sheet selection.
- Kept the recurring switch in a stable card, gave its thumb a 100 ms transform-only animation,
  and deferred mounting the recurrence details so the switch response is not coupled to a blurred
  subtree resize.
- Focused tests and TypeScript pass. An older pre-package recurrence flow was also verified on the
  connected RMX3867 over USB; that historical evidence is not claimed for this consolidation.

### Canonical Contract

- Keep `@ravitamil/buddy-ui` `Input` as the unlabelled input primitive.
- Keep package `FormField` as the only universal labelled field composite.
- Support label/input ID association, required state, error, warning, help text, character count,
  leading/trailing icons, multiline input, disabled state, and Android input behavior.
- Preserve consumer-controlled values and callbacks; validation remains owned by the feature.
- `ValidatedInput`, `StandardFormField`, and the private StandardFormField helper folder are deleted.

### Required Device Proof

- Input retains focus while typing.
- Keyboard does not dismiss on controlled updates.
- Cursor position remains stable.
- Secure entry and trailing actions work.
- Multiline height and vertical alignment remain correct.
- Error, warning, disabled, and helper states are legible in light and dark themes.

## Phase 3: Action Consolidation

- `Button` owns inline text and icon actions.
- `IconAction` owns icon-with-label grids.
- `FloatingAction` owns circular, extended, save, loading, destructive, and placement variants.
- `ActionButton`, `FloatingActionButton`, `ExtendedFAB`, and `SaveFAB` are deleted after consumer
  migration.

## Phase 4: Bottom-Sheet Consolidation

### Foundation Completed

- Added package `BottomSheet` as the reusable owner of sheet overlay, motion, handle, Fluid Surface frame,
  radius, safe spacing, title, and description.
- Added `BottomSheetOption` for accessible, minimum-56-point controlled radio and checkbox
  selections, including optional leading category content.
- Added `BottomSheetAction` for standard navigation and destructive action rows.
- Added package-owned safe-area padding, scrollable bodies, keyboard-aware form behavior, and
  fixed footer composition.
- Migrated all feature sheet option/action rows to the shared contracts while preserving their
  domain callbacks.
- Migrated Add Transaction recurrence frequency from inline chips to the shared selection sheet.
- Reclassified confirmation interactions as `Dialog`/`ConfirmationDialog` and removed the last
  feature-owned raw Tamagui dialogs.
- Removed unused Gorhom bottom-sheet and Expo action-sheet providers and direct dependencies;
  `react-native-modal` remains only as the hCaptcha package's transitive peer.

### Final State

Package `BottomSheet` owns controlled native sheets. `BottomSheetAction` owns command rows and
`BottomSheetOption` owns single- and multi-select rows. Dialog touch adaptation is private to the
package. Domain content remains feature-owned. App-local `AppBottomSheet`, `AppAdaptSheet`, and
`CustomActionSheet` implementations are retired, and a package-boundary test rejects raw overlay
infrastructure in feature code.

## Phase 5: Metric Card Consolidation

- `MetricCard` now models semantic tone, icon, trend, progress, compact/regular density, and
  pressability.
- The ignored `gradientColors` contract is gone.
- `StatCard` and `ModernStatCard` are deleted after all consumers migrated.

## Phase 6: Screen-Shell Consolidation

The only public composition path is:

1. `ScreenContainer` is the outermost shell and appears once. It owns the full-screen background,
   blur target, dotted treatment, and safe-area edges.
2. `CustomNavigationHeader`, when present, is a direct child of `ScreenContainer`.
3. `ScreenWrapper` owns content padding, scrolling, refresh behavior, and its explicit
   `keyboardMode`. Inside `ScreenContainer`, it automatically suppresses its own safe-area and
   background so padding and full-screen surfaces do not compete.
4. Feature content is rendered inside `ScreenWrapper`. A feature may use `ScreenWrapper` without a
   `ScreenContainer` only when it is intentionally an embedded or modal content surface.

`SafeAreaWrapper` and `StandardKeyboardAvoidingView` are internal implementation adapters and are
not public barrel exports. Application screens must not import them. `LegacyScreenWrapper` had no
consumers and has been removed.

## Validation Gate Per Family

1. Record current consumers and public props.
2. Add or update focused tests for the canonical contract.
3. Migrate one feature batch at a time.
4. Run TypeScript, focused ESLint, focused tests, and `git diff --check`.
5. Leave live device interaction to the consuming application's release validation when requested.
6. Delete the redundant implementation only after its final consumer is removed.

## Final Consolidation Verification

Captured on 2026-08-22 after package extraction and repository consolidation:

- TypeScript: root and package type checks passed.
- ESLint and formatting: root ESLint has no errors; package lint has zero warnings; root and package
  formatting checks passed.
- Unit tests: 83 suites and 360 tests passed.
- Reachability: 343 active component files and zero unreachable, test-only, or story-only files.
- Publication: Builder Bob ESM/CommonJS/declarations, Publint, ATTW's Node 16+/bundler profile,
  package dry-run, and a packed Expo consumer TypeScript smoke test passed.
- Android: arm64 debug `assembleDebug` passed in 1 minute 2 seconds; 33 of 887 tasks executed.
  No emulator, ADB, install, launch, or connected-device validation was performed.
- iOS: a macOS GitHub Actions workflow performs Expo prebuild, CocoaPods installation, and an
  unsigned simulator build. It cannot be executed locally on Windows and remains a CI gate.

## Component Usage Enforcement Audit

Captured on 2026-08-23 across 1,113 application, route, and package source files:

- Hard package/app/feature ownership violations: 0.
- Raw Tamagui, React Native, or third-party overlay infrastructure violations: 0.
- Remaining direct Tamagui branded-control imports: 0. All previous `Button`, `Text`, `Spinner`,
  `Input`, `Card`, and `Switch` findings now use the canonical Buddy UI contracts.
- Reachability remains 343 active component files and 0 unreachable files.

The ownership, overlay, and branded-control preference rules are errors. BuddyIO and applications
using the reusable `@ravitamil/buddy-ui/eslint` recommended config therefore reject new direct
Tamagui imports for package-owned controls while continuing to permit layout primitives such as
`XStack`, `YStack`, and `ScrollView`.

## Historical Connected Android Baseline

This older evidence was captured on RMX3867 on 2026-07-18 and is not proof for the current package
consolidation. At that time the app launched without a React Native or Android runtime error,
and the Add Expense route renders. The baseline screenshot is stored outside the repository at
`C:\Users\ravik\.codex\visualizations\2026\07\18\019f7561-9551-7de0-baec-319e745ae4a6\buddy-ui-form.png`.

The screen establishes these concrete visual acceptance criteria for later migration batches:

- Increase subtitle contrast and preserve readable secondary text in both themes.
- Stop using the expense coral tone for neutral actions, icons, and selection states.
- Reduce competing card, input, chip, and glass surface recipes to the shared elevation roles.
- Give the floating save action a safe-area-aware placement that never obscures form content.
- Keep type choice, category choice, and form controls visually related through common spacing,
  radius, focus, and selected-state contracts.

The recurrence follow-up was verified on the same device over USB. Toggling recurring now renders
the checked state and frequency field immediately; the measured transition had no 150 ms frames
(99th percentile 32 ms versus the 150 ms pre-fix observation). The shared sheet opened with a
visible title and description, exposed each frequency as an accessible selected option, changed
Monthly to Daily, and dismissed without a JavaScript/runtime or missing-blur-target warning.

## Reusable Package Foundation

`packages/buddy-ui` now contains portable spacing, radii, touch targets, icon sizes, motion values,
semantic colors, theme creation, Tamagui configuration, and universal form composition. Its
consumption and brand-override contract is documented in `packages/buddy-ui/README.md`.

The package is versioned as `@ravitamil/buddy-ui@0.1.0` and configured as a restricted GitHub
Packages release. It publishes compiled ESM, CommonJS, and declarations; has package boundary,
theme, accessibility, publication, and packed-consumer checks; and has Changesets plus release and
iOS-simulator workflows. Consumers can customize brand, palette, semantic, surface, glass, and
content roles without importing BuddyIO providers, services, routes, assets, or finance domains.
