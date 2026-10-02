# Context Pattern ESLint Rules

This directory contains custom ESLint rules to enforce proper context usage patterns during the context architecture refactor.

## Rules

### `no-app-context-usage`

**Type:** Error  
**Description:** Prevents new usage of AppContext in favor of specific contexts.

**Bad:**

```typescript
import { useApp } from '@/context/AppContext';
import { AppProvider } from '@/context/AppContext';

function MyComponent() {
  const { transactions } = useApp();
  return <div>{transactions.length}</div>;
}
```

**Good:**

```typescript
import { useFinancial } from '@/context';

function MyComponent() {
  const { transactions } = useFinancial();
  return <div>{transactions.items.length}</div>;
}
```

### `enforce-context-patterns`

**Type:** Warning  
**Description:** Enforces consistent context usage patterns and suggests specific context hooks.

**Bad:**

```typescript
const context = useContext(SomeContext);
const transactions = context.transactions;
```

**Good:**

```typescript
const {transactions} = useFinancial();
```

### `context-provider-order`

**Type:** Warning  
**Description:** Enforces proper context provider hierarchy order.

**Correct Order:**

1. CoordinationProvider
2. AuthProvider
3. SettingsProvider
4. FinancialProvider
5. GroupProvider
6. TrackerProvider

**Bad:**

```tsx
<FinancialProvider>
  <AuthProvider>
    {' '}
    {/* AuthProvider should be higher */}
    <App />
  </AuthProvider>
</FinancialProvider>
```

**Good:**

```tsx
<AuthProvider>
  <FinancialProvider>
    <App />
  </FinancialProvider>
</AuthProvider>
```

### `no-context-anti-patterns`

**Type:** Error  
**Description:** Prevents common context anti-patterns that hurt performance.

**Bad:**

```tsx
// Inline context value (causes re-renders)
<MyContext.Provider value={{data: someData, method: someMethod}}>
  <App />
</MyContext.Provider>;

// Direct context mutation
context.transactions = newTransactions;
```

**Good:**

```tsx
// Memoized context value
const contextValue = useMemo(
  () => ({
    data: someData,
    method: someMethod,
  }),
  [someData, someMethod],
);

<MyContext.Provider value={contextValue}>
  <App />
</MyContext.Provider>;

// Proper state management
dispatch({type: 'SET_TRANSACTIONS', payload: newTransactions});
```

### `deprecation-warnings`

**Type:** Warning  
**Description:** Shows deprecation warnings for legacy context methods.

**Deprecated Methods and Replacements:**

- `addTransaction` → `useFinancial().transactions.add()`
- `updateTransaction` → `useFinancial().transactions.update()`
- `deleteTransaction` → `useFinancial().transactions.delete()`
- `addCategory` → `useFinancial().categories.add()`
- `setCurrency` → `useSettings().updateCurrency()`
- `formatCurrency` → `useSettings().formatCurrency()`

## Configuration

### Development Mode (Warnings Only)

Use `.eslintrc.context-migration.js` during the migration phase:

```bash
npm run lint:context
```

### Production Mode (Strict)

Use the main `eslint.config.js` for new code:

```bash
npm run lint
```

## Migration Scripts

### Check Context Patterns

Analyze your codebase for context usage patterns:

```bash
npm run check-context-patterns
```

This will generate a report showing:

- Files using deprecated patterns
- Migration priority order
- Specific suggestions for each issue

### Example Output

```
🔍 Context Pattern Analysis Report
=====================================

📊 Summary:
  Total files checked: 45
  Files with issues: 12
  Migration progress: 73%

🚨 Issues found:
  AppContext usage: 8
  Deprecated methods: 15
  Direct context access: 3
  AppProvider usage: 1

🎯 Migration Priority:

Top 10 files to migrate first:
  1. src/screens/HomeScreen.tsx (5 issues)
  2. src/components/TransactionList.tsx (4 issues)
  3. src/screens/BudgetScreen.tsx (3 issues)
```

## Integration with CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/lint.yml
- name: Check Context Patterns
  run: |
    npm run check-context-patterns
    npm run lint:context
```

## Gradual Migration Strategy

1. **Phase 1:** Enable warnings only

   ```bash
   npm run lint:context
   ```

2. **Phase 2:** Fix high-priority files first

   ```bash
   npm run check-context-patterns
   ```

3. **Phase 3:** Enable strict mode for new files

   ```javascript
   // In eslint.config.js
   overrides: [
     {
       files: ['src/components/new/**/*.tsx'],
       rules: {
         'context-patterns/no-app-context-usage': 'error',
       },
     },
   ];
   ```

4. **Phase 4:** Full migration - enable all rules as errors

## Disabling Rules

For legacy files that can't be migrated immediately:

```typescript
/* eslint-disable context-patterns/no-app-context-usage */
const {transactions} = useApp(); // Legacy usage
/* eslint-enable context-patterns/no-app-context-usage */
```

Or in eslint config:

```javascript
overrides: [
  {
    files: ['src/legacy/**/*.tsx'],
    rules: {
      'context-patterns/no-app-context-usage': 'off',
    },
  },
];
```

## Contributing

When adding new rules:

1. Add the rule to `context-patterns.js`
2. Update this README with examples
3. Add tests for the rule
4. Update the migration script if needed
