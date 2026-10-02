# Phase 8 Plan: Clean Structure Hardening

## Goal

Make the repo match the intended clean architecture rather than the stale Phase 7 checkbox state: small screen bodies, feature-owned domain code, retired server-state contexts, portable quality gates, and a lint/test baseline that can become release-blocking again.

## Waves

1. Baseline and guardrails.
2. Tooling and test repair.
3. Provider and context retirement.
4. Feature ownership and service relocation.
5. Screen module decomposition.
6. Type-aware ESLint burn-down.
7. Legacy and storage cleanup.

## Execution Rules

- Preserve unrelated dirty worktree changes.
- Run parallel workers only on disjoint write scopes.
- Keep commits or staged groups scoped to one logical slice.
- Do not run `expo start`.
- Use PowerShell-compatible commands and `cmd /c npx tsc --noEmit`.
- Use `npx expo install` for dependency changes.

## Done Criteria

- `cmd /c npx tsc --noEmit` passes.
- `cmd /c npm run test:integration -- --watchAll=false` passes.
- `cmd /c npm run lint -- --quiet` passes.
- `cmd /c npm run format:check` passes.
- `cmd /c npm run test:unit -- --watchAll=false` passes or remaining failures are explicitly converted into tracked tasks with owner and reason.
- No implementation screen file in `src/screens` or `src/screenModules` exceeds 400 lines unless documented as an intentional exception.
