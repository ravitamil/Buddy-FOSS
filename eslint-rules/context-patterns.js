/**
 * Custom ESLint Rules for Context Usage Patterns
 *
 * This file contains custom ESLint rules to enforce proper context usage patterns
 * and prevent anti-patterns during the context architecture refactor.
 */

module.exports = {
  rules: {
    'no-app-context-usage': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent new usage of AppContext in favor of specific contexts',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          noAppContextUsage:
            'Avoid using AppContext. Use focused domain hooks instead: useAuth(), useBudgetState(), useSavingsState(), useTransactionsQuery(), useGroups(), useLoansQuery(), useInvestmentsQuery(), useSettings()',
          noAppContextImport: 'Avoid importing AppContext. Import specific context hooks instead.',
        },
      },
      create(context) {
        return {
          // Check for useApp() hook usage
          CallExpression(node) {
            if (node.callee.type === 'Identifier' && node.callee.name === 'useApp') {
              context.report({
                node,
                messageId: 'noAppContextUsage',
              });
            }
          },

          // Check for AppContext imports
          ImportDeclaration(node) {
            if (node.source.value && node.source.value.includes('AppContext')) {
              context.report({
                node,
                messageId: 'noAppContextImport',
              });
            }
          },

          // Check for AppProvider usage
          JSXIdentifier(node) {
            if (node.name === 'AppProvider') {
              context.report({
                node,
                messageId: 'noAppContextUsage',
              });
            }
          },
        };
      },
    },

    'enforce-context-patterns': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent context usage patterns',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          useSpecificContext:
            'Use specific context hooks instead of generic patterns: {{suggestion}}',
          preferContextHook: 'Prefer using context hooks over direct context access',
          noDirectContextAccess: 'Avoid direct context access. Use the provided hook instead.',
        },
      },
      create(context) {
        const specificContexts = {
          transactions: 'useTransactionsQuery()',
          categories: 'useCategoriesQuery()',
          budgets: 'useBudgetState()',
          savingsGoals: 'useSavingsState()',
          wallets: 'useWalletsQuery()',
          groups: 'useGroups()',
          loans: 'useLoansQuery()',
          subscriptions: 'useSubscriptionsQuery()',
          investments: 'useInvestmentsQuery()',
          currency: 'useSettings()',
          language: 'useSettings()',
          user: 'useUser()',
          profile: 'useUser()',
        };

        return {
          // Check for direct context usage patterns
          MemberExpression(node) {
            if (
              node.object &&
              node.object.type === 'Identifier' &&
              node.object.name === 'context' &&
              node.property &&
              node.property.type === 'Identifier'
            ) {
              const propertyName = node.property.name;
              if (specificContexts[propertyName]) {
                context.report({
                  node,
                  messageId: 'useSpecificContext',
                  data: {
                    suggestion: specificContexts[propertyName],
                  },
                });
              }
            }
          },

          // Check for React.useContext usage
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'React' &&
              node.callee.property.name === 'useContext'
            ) {
              context.report({
                node,
                messageId: 'preferContextHook',
              });
            }

            if (node.callee.type === 'Identifier' && node.callee.name === 'useContext') {
              context.report({
                node,
                messageId: 'preferContextHook',
              });
            }
          },
        };
      },
    },

    'context-provider-order': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce proper context provider hierarchy order',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          incorrectProviderOrder:
            'Context providers should follow the current hierarchy: AuthProvider > UserProvider > SettingsProvider > MembershipProvider > CategoryProvider > TransactionProvider > GroupProvider > LoanQueryProvider > SubscriptionQueryProvider > InvestmentProvider',
        },
      },
      create(context) {
        const correctOrder = [
          'AuthProvider',
          'UserProvider',
          'SettingsProvider',
          'MembershipProvider',
          'CategoryProvider',
          'TransactionProvider',
          'GroupProvider',
          'LoanQueryProvider',
          'SubscriptionQueryProvider',
          'InvestmentProvider',
        ];

        return {
          JSXElement(node) {
            if (
              node.openingElement.name.type === 'JSXIdentifier' &&
              correctOrder.includes(node.openingElement.name.name)
            ) {
              // Check if this provider is nested correctly
              let parent = node.parent;
              const foundProviders = [];

              while (parent) {
                if (
                  parent.type === 'JSXElement' &&
                  parent.openingElement.name.type === 'JSXIdentifier' &&
                  correctOrder.includes(parent.openingElement.name.name)
                ) {
                  foundProviders.push(parent.openingElement.name.name);
                }
                parent = parent.parent;
              }

              const currentProvider = node.openingElement.name.name;
              const currentIndex = correctOrder.indexOf(currentProvider);

              for (const foundProvider of foundProviders) {
                const foundIndex = correctOrder.indexOf(foundProvider);
                if (foundIndex > currentIndex) {
                  context.report({
                    node,
                    messageId: 'incorrectProviderOrder',
                  });
                  break;
                }
              }
            }
          },
        };
      },
    },

    'no-context-anti-patterns': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent common context anti-patterns',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          noContextInRender:
            'Avoid creating context values in render. Use useMemo or move outside component.',
          noInlineContextValue: 'Avoid inline context values. Use useMemo for performance.',
          noContextMutation: 'Avoid mutating context values directly. Use proper state management.',
        },
      },
      create(context) {
        return {
          // Check for context value creation in render
          JSXExpressionContainer(node) {
            if (
              node.expression.type === 'ObjectExpression' &&
              node.parent &&
              node.parent.type === 'JSXAttribute' &&
              node.parent.name &&
              node.parent.name.name === 'value'
            ) {
              // Check if this is inside a Context.Provider
              let parent = node.parent.parent;
              while (parent) {
                if (
                  parent.type === 'JSXElement' &&
                  parent.openingElement.name.type === 'JSXMemberExpression' &&
                  parent.openingElement.name.property.name === 'Provider'
                ) {
                  context.report({
                    node,
                    messageId: 'noInlineContextValue',
                  });
                  break;
                }
                parent = parent.parent;
              }
            }
          },

          // Check for direct property assignment on context values
          AssignmentExpression(node) {
            if (
              node.left.type === 'MemberExpression' &&
              node.left.object.type === 'Identifier' &&
              (node.left.object.name.includes('context') ||
                node.left.object.name.includes('Context'))
            ) {
              context.report({
                node,
                messageId: 'noContextMutation',
              });
            }
          },
        };
      },
    },

    'deprecation-warnings': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Show deprecation warnings for legacy context methods',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          deprecatedMethod: '{{method}} is deprecated. Use {{replacement}} instead.',
        },
      },
      create(context) {
        const deprecatedMethods = {
          addBudget: 'useBudgetState().addBudget()',
          updateBudget: 'useBudgetState().updateBudget()',
          deleteBudget: 'useBudgetState().deleteBudget()',
          addSavingsGoal: 'useSavingsState().addSavingsGoal()',
          updateSavingsGoal: 'useSavingsState().updateSavingsGoal()',
          deleteSavingsGoal: 'useSavingsState().deleteSavingsGoal()',
          addGroup: 'useGroups().add()',
          updateGroup: 'useGroups().update()',
          deleteGroup: 'useGroups().delete()',
          addLoan: 'useLoansQuery() with feature mutations',
          updateLoan: 'useLoansQuery() with feature mutations',
          deleteLoan: 'useLoansQuery() with feature mutations',
          setCurrency: 'useSettings().updateCurrency()',
          setLanguage: 'useSettings().updateLanguage()',
        };

        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.property.type === 'Identifier'
            ) {
              const methodName = node.callee.property.name;
              if (Object.hasOwn(deprecatedMethods, methodName)) {
                context.report({
                  node,
                  messageId: 'deprecatedMethod',
                  data: {
                    method: methodName,
                    replacement: deprecatedMethods[methodName],
                  },
                });
              }
            }
          },
        };
      },
    },
  },
};
