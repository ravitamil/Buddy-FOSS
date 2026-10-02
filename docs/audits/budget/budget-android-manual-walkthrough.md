# Budget lifecycle Android walkthrough

This checklist is the manual Android verification companion for the budget
lifecycle repair. It is intentionally not a record of a device run.

## Preconditions

- Use an authenticated test account with at least two spending categories.
- Have one loan, one subscription, and one linked recurring expense available
  when verifying fixed commitments.
- Capture a screenshot at each numbered result, including the selected theme.

## 1. Create a first plan

1. From the Home budget empty state, tap **Get Started**. Confirm that tapping
   other parts of the card does nothing.
2. Enter a plan name, period, planned income, flexible spending, and savings.
   Confirm that save remains unavailable or reports a field-level error when
   the name is empty.
3. Add an optional income source and confirm the helper explains that sources
   are planned income only, not transaction-source reconciliation.
4. Add category allocations, a savings target, and a custom allocation. Save.
5. Confirm the app replaces the setup screen with the saved plan's Details
   screen and does not briefly return to an earlier screen.

Expected: Home, Trackers, and Details show the same plan name, cycle period,
planned amounts, and initial zero spending.

## 2. Verify optional and live sections

1. Edit the first plan from Details.
2. Confirm the loans, subscriptions, and linked recurring expenses are shown
   as read-only live commitments; do not expect an editable copied amount.
3. Change only optional allocations and save.
4. Return to Details and confirm the committed total, remaining flexible
   spending, allocation list, and savings targets update together.

Expected: income sources remain a planning breakdown. Fixed commitments are
derived from their live source records.

## 3. Manage multiple plans

1. Go to Trackers and tap **New plan**. Create a distinct plan with a long
   name and a different period.
2. Confirm the original plan remains available and the new plan is active
   after saving.
3. Activate the original plan from Trackers. Confirm Home changes to it and
   the Details action opens that exact plan.
4. Edit the inactive plan and confirm it is loaded before values appear; no
   duplicate plan should be created during loading.
5. Delete the active plan. Confirm the destructive confirmation appears and
   that a remaining plan becomes active. Delete the final plan and confirm the
   empty state appears.

Expected: exactly one stored plan is active whenever at least one plan exists.

## 4. Check cycle and transaction guardrails

1. Create or reactivate a plan with category allocations.
2. Add an expense below both its category budget and flexible budget. Confirm
   the confirmation/guardrail state and then save it.
3. Add an expense that exceeds a category allocation, then one that exceeds
   remaining flexible spending. Confirm each warning identifies the relevant
   threshold without blocking ordinary entry unless the existing confirmation
   flow requires acknowledgement.
4. Compare Home, Trackers, and Details after each entry: cycle spending,
   category progress, utilization, committed costs, and safe-to-spend must
   agree.
5. Repeat the comparison on a weekly, monthly, and yearly plan. Ensure an
   expense falls only in the plan cycle that contains its date. If a group
   expense is used, verify only the user's share is counted.

Expected: every budget surface and guardrail derives from the same cycle model.

## 5. Visual and accessibility pass

1. Repeat the principal Home, Trackers, Setup, and Details states in light and
   dark themes.
2. Check long plan, category, and commitment labels for wrapping rather than
   clipping or overlap.
3. Verify each action is at least a 48pt target and has an understandable
   accessibility label: Get Started, New plan, Activate, Edit, Delete, Save,
   and guardrail actions.
4. Check loading, missing-plan/error, and no-plan empty states. Verify Fluid
   Surface surfaces retain readable semantic contrast in both themes.

Expected: screens use the shared Fluid Surface and semantic theme
tokens; no local gradient or hard-coded-color treatment is visible.

## Evidence to attach

- First-plan setup and Details replacement.
- Both plan cards with active state shown.
- Delete confirmation and active-plan fallback.
- Under-budget and over-budget guardrails.
- One dark-theme and one long-label screenshot.
