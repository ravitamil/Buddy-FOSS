# Analysis Summary

- Validation: pending centralization and schema-driven UI, plus per-field surfaces.

- Accessibility: roles/labels and summaries completed; keyboard navigation for web pending.

- Theming: glassmorphism unified; tokenization and dark/light consistency partially completed.

- Layout & Structure: several screens still use raw RN components and inline styles; more Tamagui primitives and presentational components needed.

- State & Composition: AddGroup and FindGroup screens benefit from further decomposition; identity usage should prefer IDs over display names.

- Routing Consistency: needs an audit to ensure `expo-router` files exist for all group routes.

- Screen-specific: SettlementHistory still needs roles/states on rows/buttons, richer hints, and web focus order.

# Implementation Plan

## Validation (Shared Module & UI Integration)

1. Create `src/utils/validation/schemas.ts` with TypeScript-driven schemas for:

   - `Expense`: description, amount, category, split method/details

   - `Payment`: paidBy, receivedBy, amount, description

   - `Splits`: custom/percentage/shares, totals validation and rounding guidance

2. Refactor screen-level checks in AddGroup and FindGroup to call shared schema validators.
3. Enhance `StandardFormField` to accept `error`, `helperText`, and `aria-invalid` for per-field feedback.
4. Add a light `useValidation` hook to bind field values to schema, compute errors, and expose `isValid`.

## Accessibility (Keyboard Navigation on Web)

1. Add `focusable` and `tabIndex` to interactive elements on web.
2. Implement `onKeyDown` handlers for Enter/Space activation on toggles/buttons.
3. Ensure visible focus ring via Tamagui `focusStyle` and consistent order across controls.
4. Verify navigation and interactions on web routes (AddGroup, FindGroup, SettlementHistory, GroupInsights).

## Theming (Tokenization & Dark/Light Consistency)

1. Continue replacing remaining rgba/hexcodes with `colorToken` across screens.
2. Normalize separators, borders, and card backgrounds using `grayX` tokens.
3. Unify shadows/elevations via existing `ShadowSystem` (use standardized `shadowColor` + opacity).
4. Add a short theming guideline to `src/utils/themeColors.md` for future contributions.

## Layout & Structure (Primitives & Components)

1. Replace inline View/HStack/VStack mixes with Tamagui `XStack/YStack` where applicable.
2. Extract small presentational components:

   - `AmountInput`

   - `TransactionTypeSelector`

   - `PaidBySelector`

   - `CategoryChipList`

   - `SplitMethodSelector`

3. Replace segmented/toggle implementations with `TamaguiToggleGroup` or Tamagui `Button` groups uniformly.

## State & Composition (Hooks & ID Standardization)

1. Create hooks:

   - `useTransactionForm` (encapsulate AddGroup form state & submission)

   - `useSettlementValidation` (wrap settlement validation & auto-fix logic)

2. Standardize identity usage:

   - Use member IDs internally for logic and storage.

   - Limit display-name handling strictly to UI rendering; remove any logic branching on names.

## SettlementHistoryScreen (Remaining Accessibility Tasks)

1. Add roles/labels/states to list rows and action buttons consistently.
2. Provide meaningful `accessibilityHint` for “Record Payment” and “View Receipt”.
3. Define keyboard focus order for web and apply visible focus ring.

## Routing Consistency

1. Audit `app/` for all group routes (`/groups/[id]`, `/groups/[id]/add-transaction`, `/groups/[id]/insights`, `/groups/[id]/settlement-history`).
2. Create missing route files and deep-link configs; ensure `expo-router` navigation consistency.

## Documentation Updates

1. Update `docs/GroupUI_Audit.md` statuses to reflect completed items and new progress.
2. Replace outdated Next Actions with the above plan, and add concise acceptance criteria per task.

## Verification

1. Run `npm run type-check` to ensure TypeScript correctness.
2. Manual checks on device/web for keyboard navigation and focus rings.
3. Visual inspection for dark/light consistency on key screens.
4. Confirm validators catch invalid inputs and per-field error surfaces render correctly.

## Deliverables

- Shared validation module and `useValidation` hook

- Screen refactors to use schema-driven feedback

- Keyboard navigation support on web routes

- Theming consistency and tokenization updates

- Presentational components and primitives adoption

- SettlementHistory accessibility improvements

- Router files audit & fixes

- Updated audit documentation
