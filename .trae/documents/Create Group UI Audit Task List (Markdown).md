## Objective

- Create a single authoritative markdown document that captures the current Group screens’ UI audit and converts findings into a taskable checklist.
- Use clear sections with checkboxes, owners, and status to update systematically as work progresses.

## File Details

- Path: `docs/GroupUI_Audit.md`
- Structure: Headings per category + subsections per screen/component + checklists with `[ ]` and `[x]`.
- Style: Concise bullets, one-line actionable tasks, references to source paths.

## Document Structure

### 1) Overview

- Scope of screens/components
- Goals of refactor and expected outcomes

### 2) What’s Well Implemented

- Bullet list by area (navigation, splits, settlements, FX, context patterns)

### 3) Gaps & Improvements (Task Lists)

- Validation
  - [ ] Centralize schemas for expense, splits, settlement in a shared module
  - [ ] Replace screen-level ad hoc checks with schema-driven feedback
  - [ ] Field-level error surfaces with actionable messages
- Accessibility
  - [ ] Add roles/labels to interactive elements across group screens
  - [ ] Provide accessible summaries for charts
  - [ ] Ensure keyboard navigation on web routes
- Theming
  - [ ] Replace hardcoded hex colors with Tamagui tokens
  - [ ] Unify glassmorphism into `GlassmorphismContainer`
  - [ ] Audit dark/light consistency for borders/shadows/backgrounds
- Layout/Structure
  - [ ] Prefer Tamagui primitives over raw RN components for stacks and spacing
  - [ ] Remove inline style duplication; introduce small presentational components
  - [ ] Extract shared split/preview/debt logic
- State & Composition
  - [ ] Break up `AddGroupTransactionScreen` into smaller components
  - [ ] Break up `FindGroupAndAddTransactionScreen` with shared hooks/components
  - [ ] Standardize user identity references to IDs
- Missing Screens/Flows
  - [ ] Group Settings (currency, FX, approvals, notifications)
  - [ ] Member Detail & Role/Permission Editor
  - [ ] Invite/Join (QR/link)
  - [ ] Transaction Edit & Receipt Manager
  - [ ] Export/Share (CSV/PDF)
- Routing Consistency
  - [ ] Ensure explicit `expo-router` files under `app/` for all group routes

### 4) Screen-Specific Checklists

- `GroupDetailScreen`
  - [ ] Replace inline colors with tokens
  - [ ] Add accessible labels on action icons
  - [ ] Move settlement preview to shared component
- `AddGroupTransactionScreen`
  - [ ] Extract percentage/shares editor into reusable component
  - [ ] Centralize validation messages; per-field feedback
  - [ ] Convert layout to Tamagui primitives
- `FindGroupAndAddTransactionScreen`
  - [ ] De-duplicate split and preview logic via shared hooks
  - [ ] Improve debt selection accessibility and labels
  - [ ] Tokenize colors and unify glassmorphism
- `SettlementHistoryScreen`
  - [ ] Accessible summaries for suggested payments and history sections
  - [ ] Shared card styling through unified container
- `GroupInsightsScreen`
  - [ ] Provide chart ARIA-like descriptions; keyboard navigation support

### 5) Process & Update Protocol

- Status codes: `[ ]` pending, `[>]` in-progress, `[x]` completed
- Each task line begins with: `path • short action • owner • status`
- Use commit references or PR links appended at the end of each completed item (optional)
- Review cadence: update after each merged change; keep this as the source of truth

### 6) References

- Source file paths for quick navigation
- Design tokens and component libraries in use

## Execution Notes

- After approval, I will create `docs/GroupUI_Audit.md` with the above structure and pre-populate the checklist items (including source paths) so it is immediately actionable. I will then start marking items as in-progress/completed as we implement changes.
