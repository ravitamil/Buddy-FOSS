---
name: clean-code
description: Code quality, refactoring, and strict TypeScript guidelines for Buddy. Use when reviewing code, refactoring contexts or services, fixing TypeScript errors, or preparing commits.
---

# Clean Code & Refactoring Guidelines for Buddy

## 1. Strict TypeScript Standards

- Buddy runs under strict TypeScript mode.
- **Never use `any`**; create or import proper interfaces from `src/types/`.
- Run type checking regularly: `npx tsc --noEmit`.
- Before ending any work session, all TypeScript errors must be 100% resolved.
- When resolving errors, fix from bottom to top (type definitions and dependencies first).

## 2. No Backward Compatibility Policy

- Buddy has **no active production users** and is in active development.
- **Never add backward compatibility code, legacy adapters, or migration fallbacks**.
- **Never keep deprecated functions/hooks** "for later cleanup".
- Delete old code, unused imports, and obsolete files immediately after refactoring.
- Update all call sites across the codebase in a single session.

## 3. Modular Context Architecture

- **Single Responsibility**: Each context manages one specific domain (e.g. `TransactionContext`, `BudgetContext`, `LoanContext`, `EnhancedGroupContext`).
- **No Monolithic Contexts**: Never re-create "God Objects" like `AppContext`.
- **Coordination Layer**: Cross-domain coordination and global refreshes must use `CoordinationProvider`.
- **Domain Hooks**: Components must consume domain-specific hooks (`useTransaction`, `useBudget`, `useLoan`, `useGroups`, etc.).
- Avoid direct coupling between domain contexts.

## 4. Logging & Alerts

- **No `console.log`**: Console statements are banned by ESLint. Use `EnhancedLoggerService` for debug/info/warn/error logging.
- **No `Alert.alert`**: Use `ConfirmationDialog` through the `useAlert()` hook.

## 5. Session Quality Gate

Before completing any task:

1. `npx tsc --noEmit` (Must pass with 0 errors)
2. `npm run lint` / `npm run lint:all`
3. Remove all temporary `TODO` comments.
4. Follow Conventional Commits format: `<type>(<scope>): <imperative description>`.
