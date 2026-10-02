# AI Development Workflow Rules for Buddy

> [!IMPORTANT]
> These rules MUST be followed by all AI agents working on this project. This is an AI-driven development project with no active user base, allowing for aggressive refactoring and no backward compatibility requirements.

## Project Context

- **Development State**: Active development, no production users
- **Platform**: React Native with Expo
- **UI Framework**: Tamagui (primary), custom components (secondary)
- **Backend**: Supabase (Authentication, Database, Storage)
- **Testing Scope**: Unit testing and iOS/web are OUT OF SCOPE
- **Package Manager**: Use `expo install` for all Expo-compatible packages

## Core Principles

### 1. Code Quality & Completion

- ✅ **ALWAYS** fix all TypeScript errors before ending a session
- ✅ **ALWAYS** run `npx tsc --noEmit` to verify compilation
- ✅ **NEVER** leave code in a broken state
- ✅ **NEVER** leave TODO comments without implementing them
- ✅ **ALWAYS** complete the feature you're working on

### 2. No Backward Compatibility

- ❌ **NEVER** add backward compatibility code
- ❌ **NEVER** keep deprecated functions/hooks "for migration"
- ❌ **NEVER** use feature flags for gradual rollouts
- ✅ **ALWAYS** delete old code immediately after refactoring
- ✅ **ALWAYS** update all usages in a single session

### 3. Dependency Management

- ✅ **ALWAYS** use `expo install <package>` for installation
- ✅ **ALWAYS** check Expo compatibility before adding packages
- ❌ **NEVER** use `npm install` or `yarn add` directly
- ✅ **ALWAYS** update `package.json` when adding dependencies
- ✅ **PREFER** Expo-compatible packages over alternatives

### 4. UI Development

- ✅ **ALWAYS** use Tamagui components as first choice
- ✅ **ALWAYS** use custom components from `src/components` when available
- ✅ **ALWAYS** follow existing design patterns and styling
- ✅ **ALWAYS** ensure responsive design (mobile-first)
- ❌ **NEVER** use raw React Native components when Tamagui equivalent exists
- ✅ **ALWAYS** use the theme system (`useTamaguiTheme`) for colors

### 5. Architecture & Patterns

- ✅ **ALWAYS** follow the modular context architecture
- ✅ **ALWAYS** use domain-specific hooks (`useSavings`, `useTransaction`, etc.)
- ❌ **NEVER** create monolithic contexts
- ✅ **ALWAYS** keep contexts focused on a single domain
- ✅ **ALWAYS** use TypeScript strict mode
- ✅ **ALWAYS** define proper types and interfaces

### 6. Session Management Rules

#### Before Ending Session (MANDATORY)

1. ✅ **CRITICAL**: Run `npx tsc --noEmit`
2. ✅ **CRITICAL**: Fix ALL TypeScript errors
3. ✅ **CRITICAL**: Verify no broken imports
4. ✅ **CRITICAL**: Remove all TODO comments
5. ✅ **CRITICAL**: Commit all changes
6. ✅ Update task.md with completion status

## Emergency Procedures

### If TypeScript Errors Occur

1. Run `npx tsc --noEmit` to see all errors
2. Fix errors from bottom to top (dependencies first)
3. If file is corrupted, restore from git: `git checkout HEAD -- <file>`
4. Verify fix with another `npx tsc --noEmit`

---

**Remember**: This is an active development project. Be aggressive with refactoring, delete old code immediately, and never add backward compatibility. Always fix TypeScript errors before ending a session.
