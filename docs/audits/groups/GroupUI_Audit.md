# Group UI Audit & Task List

## Overview

- Scope: Groups-related screens and shared UI/components
- Goal: Identify strengths, gaps, and convert them into an actionable checklist to guide aggressive refactoring

## Well Implemented

- Navigation header and primary actions are consistent across screens
- Split methods (equal/custom/percentage/shares) implemented end-to-end with validations and previews
- Settlement integrity enforced with pairwise caps; suggested payments shown; `settledDebtAmounts` recorded for traceability
- FX integration path: all balance calculations convert to group currency via `prepareTransactionsWithFx`; `FXRatesScreen` seeds rates
- Context architecture standardized for CRUD, validation wrappers, and balance recalculation

## Gaps & Improvements (Task Lists)

### Validation

- [x] Centralize schemas for expense/splits/settlements in shared validation module
- [x] Replace screen-level ad hoc checks with schema-driven UI feedback
- [x] Implement per-field error surfaces (inline) with actionable guidance

### Accessibility

- [x] Add `accessibilityRole`/`accessibilityLabel` to interactive elements across group screens
- [x] Provide accessible summaries for charts and suggested payments
- [x] Ensure keyboard navigation support on web routes

### Theming

- [>] Replace hardcoded hex colors with Tamagui tokens everywhere (in progress on AddGroupTransactionScreen)
- [x] Unify glassmorphism into `GlassmorphismContainer` with `card`/`modal` variants
- [x] Audit and fix dark/light consistency for borders, shadows, and backgrounds

### Layout & Structure

- [ ] Prefer Tamagui primitives for layout/spacing over raw RN components
- [ ] Remove inline style duplication; introduce small presentational components
- [ ] Extract shared split/preview/debt logic into reusable hooks/components

### State & Composition

- [ ] Break up `AddGroupTransactionScreen.tsx` into smaller presentational components and domain hooks
- [ ] Break up `FindGroupAndAddTransactionScreen.tsx` and reuse shared split/preview/debt logic
- [ ] Standardize user identity references on IDs, removing display-name fallbacks

### Missing Screens/Flows

- [ ] Group Settings (currency, FX, split defaults, approvals, notifications)
- [ ] Member Detail & Role/Permission Editor
- [ ] Invite/Join (QR/link)
- [ ] Transaction Edit & Receipt Manager
- [ ] Export/Share (CSV/PDF)

### Routing Consistency

- [ ] Ensure explicit `expo-router` files under `app/` for all group routes and deep links

## Screen-Specific Checklists

### GroupDetailScreen

- [x] Replace inline colors with tokens
- [x] Add accessible labels on action icons
- [x] Move settlement preview into a shared component

### AddGroupTransactionScreen

- [x] Extract percentage/shares editor into reusable component
- [x] Centralize validation messages; per-field feedback
- [x] Convert layout to Tamagui primitives

## Progress Updates (Path • Action • Status)

- src/screens/AddGroupTransactionScreen.tsx • adopt SplitEditor for custom/percentage/shares • [x]

### FindGroupAndAddTransactionScreen

- [x] De-duplicate split/preview logic via shared hooks/components
- [x] Improve debt selection accessibility and labels
- [x] Tokenize colors and unify glassmorphism usage

### SettlementHistoryScreen

- [x] Add accessible summaries for Suggested Payments and Payment History sections
- [x] Add roles/labels/states on list rows and action buttons
- [x] Ensure meaningful `accessibilityHint` on “Record Payment” and “View Receipt”
- [x] Define keyboard focus order and visual focus ring for web
- [x] Use unified glassmorphism container for consistent card styling

### GroupInsightsScreen

- [x] Provide chart ARIA-like descriptions and ensure keyboard focus order for interactive elements

## Progress Updates (Path • Action • Status)

- src/components/ui/GlassmorphismContainer.tsx • create shared container with variants and sectionColor • [x]
- src/screens/AddGroupTransactionScreen.tsx • unify glassmorphism usage • [x]
- src/screens/AddGroupTransactionScreen.tsx • centralized validation integration • [x]
- src/screens/AddGroupTransactionScreen.tsx • add accessibility labels/roles for split editor controls • [x]
- src/screens/AddGroupTransactionScreen.tsx • replace select hex colors with Tamagui tokens • [>]
- src/screens/FindGroupAndAddTransactionScreen.tsx • replace select hex colors with Tamagui tokens • [x]
- src/screens/FindGroupAndAddTransactionScreen.tsx • adopt GlassmorphismContainer across sections • [x]
- src/screens/SettlementHistoryScreen.tsx • use GlassmorphismContainer for suggestions section • [x]
- src/utils/themeColors.ts • add token/theme color resolver utilities • [x]
- src/screens/GroupInsightsScreen.tsx • add accessible chart summaries and hints • [x]
- src/screens/SettlementHistoryScreen.tsx • add accessible summaries and button a11y • [x]
- src/screens/AddGroupTransactionScreen.tsx • add roles/labels on toggles and recipients • [x]
- src/screens/AddGroupTransactionScreen.tsx • replace remaining rgba backgrounds with tokens • [x]
- src/screens/AddGroupTransactionScreen.tsx • convert transaction type & paid-by chips to Tamagui Button • [x]
- src/screens/AddGroupTransactionScreen.tsx • convert category chips and split toggles to Tamagui • [x]
- src/utils/validation/schemas.ts • create shared validators for expense/payment/splits • [x]
- src/screens/FindGroupAndAddTransactionScreen.tsx • integrate shared validators • [x]
- src/components/ui/StandardFormField.tsx • enhance accessibility with error hint state • [x]
- src/screens/GroupInsightsScreen.tsx • unify button shadow via ShadowSystem • [x]
- docs/Theming_Guidelines.md • add theming guideline documentation • [x]
- src/screens/FindGroupAndAddTransactionScreen.tsx • add roles/labels on toggles and paid-by chips • [x]
- src/screens/FindGroupAndAddTransactionScreen.tsx • tokenize preview and controls for light/dark • [x]
- src/screens/SettlementHistoryScreen.tsx • normalize row backgrounds and icon colors • [x]
- src/screens/GroupInsightsScreen.tsx • replace separators with theme tokens • [x]

## Next Actions (Focused)

- Continue tokenization where rgba/hexcodes remain in shared UI components • [>]
- Replace remaining segmented toggles in other screens with Tamagui primitives • [>]
- Decompose AddGroup & FindGroup further into presentational components and domain hooks • [>]

## Process & Update Protocol

- Status: `[ ]` pending, `[>]` in-progress, `[x]` completed
- Task format: `path • short action • owner • status`
- Update cadence: after each merged change, update status here
- Optional: append commit/PR links to completed tasks for traceability

## References

- `src/screens/GroupDetailScreen.tsx`
- `src/screens/AddGroupTransactionScreen.tsx`
- `src/screens/FindGroupAndAddTransactionScreen.tsx`
- `src/screens/SettlementHistoryScreen.tsx`
- `src/screens/GroupInsightsScreen.tsx`
- `src/context/EnhancedGroupContext.tsx`
- `src/utils/prepareFx.ts`, `src/screens/FXRatesScreen.tsx`
