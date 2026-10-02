# Whole-Project Structure Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development for parallel disjoint batches, or superpowers:executing-plans for inline execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the entire BuddyIO codebase into a clean, modular structure across providers, services, features, UI components, hooks, types, routes, tests, naming, and dependencies, not just `src/screens` and `src/screenModules`.

**Architecture:** Move ownership toward feature modules and small shared primitives. Contexts should only provide app/session state or temporary adapters, services should represent focused infrastructure/domain operations, UI components should be reusable visual primitives or feature-owned sections, and route/screen files should remain composition shells.

**Tech Stack:** React Native + Expo Router, TypeScript strict mode, Tamagui, TanStack Query, Jest, ESLint, Prettier, PowerShell validation commands.

---

## Current Evidence Snapshot

- Repo-wide lint is currently green: `cmd /c npx eslint src --quiet`.
- Type-check is currently green: `cmd /c npx tsc --noEmit`.
- Unit and integration tests are currently green.
- `src/screens` and `src/screenModules` are at 0 files over 400 lines.
- Whole-project oversized implementation files still exist outside screen modules. Highest-priority examples from the latest scan:
  - `src/context/EnhancedGroupContext.tsx`: 1250 lines.
  - `src/components/ui/CreditCardForm.tsx`: 847 lines.
  - `src/types/context-foundation.ts`: 792 lines.
  - `src/services/FinancialDataService.ts`: 743 lines.
  - `src/context/BudgetContext.tsx`: 738 lines.
  - `src/services/BudgetNotificationService.ts`: 734 lines.
  - `src/services/GroupNotificationService.ts`: 732 lines.
  - `src/context/SettingsContext.tsx`: 728 lines.
  - `src/features/groups/components/FindGroupAndAddTransactionContent.tsx`: 715 lines.
  - `src/services/NotificationService.ts`: 704 lines.
- Remaining `Enhanced*` names are mixed:
  - Real structural debt: `EnhancedGroupContext.tsx`, `EnhancedErrorBoundary.tsx`.
  - Naming/contract debt: `EnhancedAuthContext.tsx`, `EnhancedLoggerService.ts`, `enhanced-group.types.ts`.
  - Verify-delete or rename candidate: `EnhancedBudgetService.ts`.
  - Story/demo debt: `EnhancedErrorBoundary.stories.tsx`, `EnhancedScreenWrapper.stories.tsx`.

## Global Execution Rules

- Preserve unrelated dirty worktree changes.
- Do not run `expo start`.
- Use PowerShell syntax.
- Use `cmd /c npx tsc --noEmit` for type-check.
- Do not delete from static unused-export reports without import, route, and runtime reference verification.
- Prefer feature-owned hooks/components over broad shared abstractions.
- Shared modules must contain reusable mechanics or UI chrome only; feature-specific data flow stays in features.
- Each batch must update `.planning/phases/08-clean-structure-hardening/08-PROGRESS.md`.
- Each batch must run:
  - `cmd /c npx eslint <touched-files> --quiet`
  - `cmd /c npx tsc --noEmit`
- Final gate after a wave:
  - `cmd /c npm run format:check`
  - `cmd /c npx eslint src --quiet`
  - `cmd /c npx eslint src --format json --quiet`
  - `cmd /c npm run test:unit -- --watchAll=false`
  - `cmd /c npm run test:integration -- --watchAll=false`
  - oversized implementation scan for `src`, plus the existing screen/screenModule scan.

---

## Wave 1: Measurement And Guardrails

**Purpose:** Stop subjective cleanup. Create repeatable structure snapshots for size, duplicates, unused candidates, naming debt, and dependency usage.

**Files:**

- Create: `.planning/phases/08-clean-structure-hardening/08-STRUCTURE-SNAPSHOT.md`
- Modify: `.planning/phases/08-clean-structure-hardening/08-PROGRESS.md`

- [ ] Run repo-wide oversized implementation scan:

```powershell
$oversized = Get-ChildItem src -Recurse -Include *.tsx,*.ts |
  Where-Object { $_.FullName -notmatch '\\__tests__\\|\.test\.|\.stories\.' } |
  ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    if ($lines -gt 400) {
      [PSCustomObject]@{
        Lines = $lines
        Path = $_.FullName.Replace((Get-Location).Path + '\','')
      }
    }
  }
$oversized | Sort-Object Lines -Descending | Format-Table -AutoSize
```

- [ ] Run screen/screenModule oversized scan:

```powershell
$oversized = Get-ChildItem src\screens,src\screenModules -Recurse -Include *.tsx,*.ts |
  ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    if ($lines -gt 400) {
      [PSCustomObject]@{
        Lines = $lines
        Path = $_.FullName.Replace((Get-Location).Path + '\','')
      }
    }
  }
if ($oversized) {
  $oversized | Sort-Object Lines -Descending | Format-Table -AutoSize
} else {
  'No src/screens or src/screenModules files over 400 lines.'
}
```

- [ ] Run duplicate scan:

```powershell
cmd /c npx jscpd src --min-lines 20 --min-tokens 120 --reporters console --ignore "**/__tests__/**,**/*.test.ts,**/*.test.tsx,**/*.integration.test.ts,**/*.performance.test.tsx"
```

- [ ] Run unused-export scan as advisory only:

```powershell
cmd /c npx ts-prune -p tsconfig.json
```

- [ ] Capture `Enhanced*` naming inventory:

```powershell
rg --files src app | rg "(?i)enhanced"
```

- [ ] Write `.planning/phases/08-clean-structure-hardening/08-STRUCTURE-SNAPSHOT.md` with these sections:
  - Current oversized files.
  - Current duplicate groups.
  - Current `Enhanced*` inventory.
  - Unused-export report caveats.
  - Recommended next wave.

---

## Wave 2: Naming And Contract Cleanup

**Purpose:** Remove legacy naming where it is safe, and separate cosmetic renames from structural refactors.

### Task 2.1: Remaining UI Recovery Names

**Files:**

- Rename: `src/components/ui/EnhancedErrorBoundary.tsx` -> `src/components/ui/RecoveryErrorBoundary.tsx`
- Rename: `src/components/ui/EnhancedScreenWrapper.tsx` -> `src/components/ui/RecoveryScreenWrapper.tsx` or delete if unused.
- Rename or delete story files after confirming storybook usage:
  - `src/components/ui/EnhancedErrorBoundary.stories.tsx`
  - `src/components/ui/EnhancedScreenWrapper.stories.tsx`
- Modify: `src/components/ui/index.ts`

- [ ] Check runtime references:

```powershell
rg "EnhancedErrorBoundary|EnhancedScreenWrapper" src app -n --glob "*.ts" --glob "*.tsx"
```

- [ ] If only barrel/story references remain, prefer deleting unused stories and wrapper exports over renaming.

- [ ] If runtime references exist, rename exports and update imports.

- [ ] Validate:

```powershell
cmd /c npx eslint src\components\ui\RecoveryErrorBoundary.tsx src\components\ui\index.ts --quiet
cmd /c npx tsc --noEmit
```

### Task 2.2: Auth Context Contract Rename

**Files:**

- Rename: `src/context/EnhancedAuthContext.tsx` -> `src/context/AuthContext.tsx`
- Modify:
  - `src/context/AppProviders.tsx`
  - `src/context/index.ts`
  - every `useEnhancedAuth` import.

- [ ] Rename provider and hook:
  - `EnhancedAuthProvider` -> `AuthProvider`
  - `useEnhancedAuth` -> `useAuth`
  - `EnhancedAuthContext` -> `AuthContext`

- [ ] Keep a temporary same-file compatibility export only if needed for a single batch:

```ts
export const useEnhancedAuth = useAuth;
export const EnhancedAuthProvider = AuthProvider;
```

- [ ] Remove compatibility aliases in the same wave after all imports are updated.

- [ ] Validate:

```powershell
cmd /c npx eslint src\context\AuthContext.tsx src\context\AppProviders.tsx src\context\index.ts --quiet
cmd /c npx tsc --noEmit
```

### Task 2.3: Logger Service Rename

**Files:**

- Rename: `src/services/EnhancedLoggerService.ts` -> `src/services/LoggerService.ts`
- Modify: all logger imports across `src` and `app`.

- [ ] Rename exported singleton:
  - `enhancedLogger` -> `logger`

- [ ] Update imports by directory batch to reduce conflict risk:
  - `src/services`
  - `src/context`
  - `src/features`
  - `src/components`
  - `src/hooks`
  - `src/utils`
  - `app`

- [ ] Avoid behavior changes; this is a mechanical naming batch.

- [ ] Validate:

```powershell
cmd /c npx eslint src app --quiet
cmd /c npx tsc --noEmit
```

---

## Wave 3: Provider And Context Decomposition

**Purpose:** Reduce contexts to focused providers and retire duplicated query/non-query state paths.

### Task 3.1: Group Context Split

**Files:**

- Decompose: `src/context/EnhancedGroupContext.tsx`
- Create under `src/features/groups/context/`:
  - `GroupProvider.tsx`
  - `GroupCrudProvider.tsx` if CRUD remains context-bound.
  - `GroupMemberActions.ts`
  - `GroupSettlementActions.ts`
  - `groupContextTypes.ts`
- Modify:
  - `src/context/AppProviders.tsx`
  - `src/context/index.ts`
  - group feature hooks that consume group actions.

- [ ] Extract pure member helpers first:
  - role normalization.
  - permission calculation.
  - member add/update/remove primitives.

- [ ] Extract settlement helpers second:
  - balance recalculation triggers.
  - settlement status mutation helpers.

- [ ] Keep provider API stable for one batch, then rename:
  - `EnhancedGroupProvider` -> `GroupProvider`
  - `useEnhancedGroups` -> `useGroups`
  - `EnhancedGroupContextType` -> `GroupContextType`

- [ ] Move `EnhancedGroup` type rename only after provider consumers are green:
  - `EnhancedGroup` -> `Group`
  - `EnhancedGroupMember` -> `GroupMember`
  - `src/types/enhanced-group.types.ts` -> `src/features/groups/types.ts` or `src/types/group.types.ts`

- [ ] Validate after each extraction:

```powershell
cmd /c npx eslint src\context\EnhancedGroupContext.tsx src\features\groups --quiet
cmd /c npx tsc --noEmit
cmd /c npm run test:integration -- --watchAll=false
```

### Task 3.2: Budget Context Retirement

**Files:**

- Inspect:
  - `src/context/BudgetContext.tsx`
  - `src/context/BudgetContext.query.tsx`
  - `src/features/budgets/*`
- Modify:
  - `src/context/AppProviders.tsx`
  - `src/context/index.ts`
  - consumers of `useBudget`.

- [ ] Decide one source of truth: TanStack Query feature hooks should own server state.

- [ ] Replace remaining context CRUD consumers with feature hooks:
  - `useBudgets`
  - `useCreateBudget`
  - `useUpdateBudget`
  - `useDeleteBudget`

- [ ] Remove provider layer only after all consumers are migrated.

- [ ] Validate:

```powershell
cmd /c npx eslint src\context\BudgetContext.tsx src\context\BudgetContext.query.tsx src\features\budgets --quiet
cmd /c npx tsc --noEmit
```

### Task 3.3: Settings Context Split

**Files:**

- Decompose: `src/context/SettingsContext.tsx`
- Create:
  - `src/features/settings/settingsStorage.ts`
  - `src/features/settings/useCurrencySettings.ts`
  - `src/features/settings/usePrivacySettings.ts`
  - `src/features/settings/useNotificationSettings.ts`

- [ ] Separate currency formatting from privacy/security settings.

- [ ] Keep `SettingsProvider` only for truly global preferences.

- [ ] Move screen-specific settings workflows into `src/features/settings/hooks`.

- [ ] Validate:

```powershell
cmd /c npx eslint src\context\SettingsContext.tsx src\features\settings --quiet
cmd /c npx tsc --noEmit
```

---

## Wave 4: Service Layer Consolidation

**Purpose:** Services should have one reason to change. Notification, financial data, and storage services currently mix concerns.

### Task 4.1: Notification Services

**Files:**

- Decompose:
  - `src/services/NotificationService.ts`
  - `src/services/GroupNotificationService.ts`
  - `src/services/BudgetNotificationService.ts`
- Create:
  - `src/services/notifications/NotificationScheduler.ts`
  - `src/services/notifications/NotificationPreferencesService.ts`
  - `src/features/groups/services/GroupNotificationRules.ts`
  - `src/features/budgets/services/BudgetNotificationRules.ts`

- [ ] Extract permission/request scheduling infrastructure into `NotificationScheduler`.

- [ ] Extract group-specific copy and trigger rules into group feature service.

- [ ] Extract budget-specific thresholds and copy into budget feature service.

- [ ] Remove duplicated scheduling/cancel/reminder code.

- [ ] Validate:

```powershell
cmd /c npx eslint src\services\NotificationService.ts src\services\GroupNotificationService.ts src\services\BudgetNotificationService.ts src\services\notifications src\features\groups\services src\features\budgets\services --quiet
cmd /c npx tsc --noEmit
```

### Task 4.2: Financial Data Service

**Files:**

- Decompose: `src/services/FinancialDataService.ts`
- Create:
  - `src/features/investments/services/MarketDataService.ts`
  - `src/features/investments/services/StockLookupService.ts`
  - `src/features/investments/services/MarketIndexService.ts`

- [ ] Split market data, stock lookup, and index data methods.

- [ ] Keep API-key access centralized in config.

- [ ] Keep output types in `src/features/investments/types.ts`.

- [ ] Validate:

```powershell
cmd /c npx eslint src\services\FinancialDataService.ts src\features\investments --quiet
cmd /c npx tsc --noEmit
```

### Task 4.3: Storage Service

**Files:**

- Decompose: `src/services/storage.ts`
- Create:
  - `src/services/storage/SecureJsonStorage.ts`
  - `src/services/storage/EntityStorage.ts`
  - `src/services/storage/storageKeys.ts`

- [ ] Split serialization/encryption concerns from entity CRUD helpers.

- [ ] Replace direct storage key strings with `storageKeys`.

- [ ] Validate:

```powershell
cmd /c npx eslint src\services\storage.ts src\services\storage --quiet
cmd /c npx tsc --noEmit
```

---

## Wave 5: Feature Component And Hook Decomposition

**Purpose:** Reduce large feature-owned UI and hooks into focused sections while keeping feature ownership.

### Task 5.1: Credit Card Form

**Files:**

- Decompose: `src/components/ui/CreditCardForm.tsx`
- Prefer new feature location if card management has a feature module:
  - `src/features/cards/components/CreditCardIdentityFields.tsx`
  - `src/features/cards/components/CreditCardLimitFields.tsx`
  - `src/features/cards/components/CreditCardBillingFields.tsx`
  - `src/features/cards/hooks/useCreditCardForm.ts`

- [ ] Move validation and derived card-brand state into `useCreditCardForm`.

- [ ] Move field groups into named section components.

- [ ] Keep the exported `CreditCardForm` as a composition shell.

- [ ] Validate:

```powershell
cmd /c npx eslint src\components\ui\CreditCardForm.tsx src\features\cards --quiet
cmd /c npx tsc --noEmit
```

### Task 5.2: Find Group And Add Transaction

**Files:**

- Decompose: `src/features/groups/components/FindGroupAndAddTransactionContent.tsx`
- Create:
  - `src/features/groups/components/find-transaction/GroupSearchSection.tsx`
  - `src/features/groups/components/find-transaction/GroupResultsSection.tsx`
  - `src/features/groups/components/find-transaction/SelectedGroupPreview.tsx`

- [ ] Keep query/filter state in the existing hook.

- [ ] Move repeated visual sections into subcomponents.

- [ ] Validate:

```powershell
cmd /c npx eslint src\features\groups\components\FindGroupAndAddTransactionContent.tsx src\features\groups\components\find-transaction --quiet
cmd /c npx tsc --noEmit
```

### Task 5.3: Add Transaction Form

**Files:**

- Decompose: `src/features/transactions/components/AddTransactionFormSections.tsx`
- Create:
  - `src/features/transactions/components/add-form/TransactionAmountSection.tsx`
  - `src/features/transactions/components/add-form/TransactionCategorySection.tsx`
  - `src/features/transactions/components/add-form/TransactionScheduleSection.tsx`
  - `src/features/transactions/components/add-form/TransactionNotesSection.tsx`

- [ ] Extract only sections; do not move submit behavior unless already isolated in hook.

- [ ] Validate:

```powershell
cmd /c npx eslint src\features\transactions\components\AddTransactionFormSections.tsx src\features\transactions\components\add-form --quiet
cmd /c npx tsc --noEmit
```

---

## Wave 6: Types And Barrel Hygiene

**Purpose:** Type files and barrel exports should not become hidden god modules.

**Files:**

- Decompose:
  - `src/types/index.ts`
  - `src/types/context-foundation.ts`
- Modify feature barrels:
  - `src/features/*/index.ts`
  - `src/context/index.ts`
  - `src/components/ui/index.ts`

- [ ] Move feature-specific types from `src/types/index.ts` into owning feature modules:
  - group types -> `src/features/groups/types`
  - budget types -> `src/features/budgets/types`
  - investment/net-worth types -> owning feature modules

- [ ] Keep `src/types/index.ts` for truly shared primitive domain types only.

- [ ] Remove barrel exports that only exist for old migration paths.

- [ ] Validate:

```powershell
cmd /c npx eslint src\types src\features src\context\index.ts src\components\ui\index.ts --quiet
cmd /c npx tsc --noEmit
```

---

## Wave 7: Dependency And Dead-Code Cleanup

**Purpose:** Remove unused packages and files only with evidence.

**Files:**

- Modify:
  - `package.json`
  - `yarn.lock`
  - `app.json` or config files only if dependency removal requires it.

- [ ] For each package candidate from `.planning/REQUIREMENTS.md`, verify imports:

```powershell
rg "zustand|bootstrap-icons|react-day-picker|prop-types|react-native-web|text-encoding|react-native-chart-kit|@shopify/react-native-skia" src app package.json
```

- [ ] Remove only packages with no runtime usage and no Expo config requirement.

- [ ] Use package manager consistently with current lockfile. Do not use `npm install`; use existing repo package flow.

- [ ] Validate:

```powershell
cmd /c npx tsc --noEmit
cmd /c npm run format:check
cmd /c npx eslint src --quiet
cmd /c npm run test:unit -- --watchAll=false
cmd /c npm run test:integration -- --watchAll=false
```

---

## Wave 8: Final Architecture Gate

**Purpose:** Prove Phase 8 is truly done across the whole project.

- [ ] Repo-wide lint snapshot:

```powershell
@'
const { execFileSync } = require('child_process');
let parsed = [];
try {
  const output = execFileSync('cmd', ['/c', 'npx', 'eslint', 'src', '--format', 'json', '--quiet'], { encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
  parsed = JSON.parse(output || '[]');
} catch (error) {
  parsed = JSON.parse(error.stdout || '[]');
}
const files = parsed.map(file => ({ filePath: file.filePath.replace(process.cwd() + '\\', ''), errors: file.errorCount })).filter(file => file.errors > 0);
console.log(JSON.stringify({ filesWithErrors: files.length, totalErrors: files.reduce((sum, file) => sum + file.errors, 0), top15: files.sort((a, b) => b.errors - a.errors).slice(0, 15) }, null, 2));
'@ | node
```

- [ ] Final gates:

```powershell
cmd /c npm run format:check
cmd /c npx eslint src --quiet
cmd /c npx tsc --noEmit
cmd /c npm run test:unit -- --watchAll=false
cmd /c npm run test:integration -- --watchAll=false
```

- [ ] Final whole-project size snapshot:

```powershell
$oversized = Get-ChildItem src -Recurse -Include *.tsx,*.ts |
  Where-Object { $_.FullName -notmatch '\\__tests__\\|\.test\.|\.stories\.' } |
  ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    if ($lines -gt 400) {
      [PSCustomObject]@{
        Lines = $lines
        Path = $_.FullName.Replace((Get-Location).Path + '\','')
      }
    }
  }
$oversized | Sort-Object Lines -Descending | Format-Table -AutoSize
```

- [ ] Phase 8 can only be called complete when:
  - lint is zero,
  - format is green,
  - TypeScript is green,
  - unit and integration gates are green,
  - `src/screens` and `src/screenModules` remain at 0 files over 400 lines,
  - remaining whole-project oversized files are either decomposed or explicitly documented as intentional exceptions,
  - remaining duplicate groups are documented as either extracted, intentionally similar, or next-phase work,
  - `Enhanced*` names are either removed or documented as intentionally retained domain names.
