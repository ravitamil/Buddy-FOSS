# BuddyIO Component Ownership Map

This map defines the component boundary after the reusable `@ravitamil/buddy-ui` package consolidation.

## Ownership Rules

| Classification     | Owner                                                      | Allowed contents                                                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui-generic`       | `packages/buddy-ui`                                        | Reusable primitives, layout wrappers, icon wrappers, theme helpers, and package-safe visual layers such as the dotted background.                                                                                                        |
| `ui-app-composite` | `src/components/ui`                                        | BuddyIO-only navigation chrome, profile orchestration, screen background ownership, toast integration, and other components that depend on app contexts, assets, routes, or services. No package compatibility wrappers.                 |
| `app-shell`        | Package mobile primitives plus `src/components/ui`         | `@ravitamil/buddy-ui/mobile` owns portable screen, safe-area, keyboard, and blur-target primitives. BuddyIO's `ScreenContainer` owns the product background; `ScreenWrapper` is its app composition adapter.                             |
| `feature-domain`   | `src/features/<feature>/components`                        | Any component whose props, text, behavior, or visuals are tied to finance/product domains such as transactions, groups, budgets, cards, wallets, investments, home finance cards, loans, savings, subscriptions, analytics, or settings. |
| `dev-only`         | `src/features/devtools/components` or non-exported stories | Showcases, examples, animation experiments, and story/demo components. These must not be exported from `src/components/ui/index.ts`.                                                                                                     |
| `delete-candidate` | Owning feature or cleanup backlog                          | Unused examples, duplicate wrappers, and one-off components that no route, source, test, story, platform sibling, or declared package entrypoint reaches.                                                                                |

## Consolidated Feature Ownership

| Component area                                                                                       | New owner                                  |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `BudgetCard`, `BudgetPlanningCard`, `budgetPlanning/*`                                               | `src/features/budgets/components`          |
| `GroupCard`, `GroupEmptyState`, `GroupFilterModal`                                                   | `src/features/groups/components`           |
| `TransactionItem`, `TransactionTypeModal`                                                            | `src/features/transactions/components`     |
| `AnimatedCreditCard`, `CardBrandImages`, `CreditCardForm`, `CreditCardLogos`, credit-card subfolders | `src/features/cards/components`            |
| `WalletWithCards`                                                                                    | `src/features/wallets/components`          |
| `LazyInvestmentChart`                                                                                | `src/features/investments/components`      |
| `QuickActionsCard`, `FinancialPlanningQuickActionsCard`                                              | `src/features/home/components`             |
| Authentication UI and success orchestration                                                          | `src/features/auth/components`             |
| Reusable analytics charts                                                                            | `src/features/analytics/components/charts` |
| Onboarding steps                                                                                     | `src/features/onboarding/components`       |
| Startup shell and initializers                                                                       | `src/features/startup`                     |

## Current Package Exports

`@ravitamil/buddy-ui` currently owns:

- Foundations and configuration: semantic themes, spacing, radii, motion, typography, `createBuddyUIThemes`, and `createBuddyUIConfig`.
- Surfaces and layout: `GlassSurface`, `Card`, `DottedBackground`, `Screen`, `ScreenScrollView`, and `KeyboardScreen`.
- Forms and actions: `Input`, `FormField`, `SelectField`, `Switch`, `ToggleField`, `SegmentedControl`, `Button`, `IconAction`, `FloatingAction`, and `ActionGrid`.
- Content and feedback: `Avatar`, `Badge`, `Text`, `MetricCard`, `ListItem`, `EmptyState`, `Skeleton`, `LoadingIndicator`, `SuccessState`, and `ToastBanner`.
- Overlays and optional native adapters: `BottomSheet`, `BottomSheetAction`,
  `BottomSheetOption`, dialogs, date picking, blur targeting, icons, and Lottie animation. Sheet
  chrome, safe-area spacing, scrolling, action-row semantics, and selection-row semantics remain
  package-owned; features supply only domain content and callbacks.

## Import Rules

- New shared UI code should import package-owned primitives from `@ravitamil/buddy-ui`.
- BuddyIO code imports package-owned components directly from `@ravitamil/buddy-ui` or its declared subpaths.
- `@/components/ui` exports only BuddyIO composites; it must not wrap or re-export package primitives.
- Import feature components from their owning feature path, for example `@/features/groups/components/GroupCard`.
- Do not add compatibility re-exports for moved domain components.
- Do not export showcases, stories, or examples from `src/components/ui/index.ts`.
- Do not import Tamagui `Sheet`, `Dialog`, or `Adapt`, React Native `Modal`, or third-party sheet
  infrastructure from feature code. Use the package overlay contracts. Dialog-to-sheet adaptation
  is an internal Buddy UI implementation detail.
- Add a component to `src/components/ui` only when it needs BuddyIO app context, assets, routes, services, or shell composition. Product-neutral components belong in the package.
- Screens compose `ScreenContainer` once, then an optional `CustomNavigationHeader`, then
  `ScreenWrapper`. Do not import `SafeAreaWrapper` or `StandardKeyboardAvoidingView` from feature or
  screen code.

## Guardrail

The reusable `@ravitamil/buddy-ui/eslint` config rejects raw overlays and direct
Tamagui branded controls in consuming applications. BuddyIO additionally enables
`development-quality/enforce-component-ownership` to protect its package/app/feature
boundaries. `src/components/ui/uiBoundary.test.ts`,
`buddyUiBoundary.package.test.ts`, and the reachability audit provide independent
boundary and reachability checks.
