/**
 * Custom ESLint Rules for Development Experience and Code Quality
 *
 * This file contains custom ESLint rules to enforce consistent patterns,
 * prevent console statements, and ensure proper usage of standardized components.
 */

const buddyUiEslint = require('../packages/buddy-ui/eslint/index.cjs');

// Helper function to check for ScreenWrapper usage
function checkForScreenWrapper(node) {
  if (!node) return false;

  if (node.type === 'JSXElement') {
    const elementName = node.openingElement.name;
    if (elementName.type === 'JSXIdentifier') {
      return ['ScreenWrapper', 'EnhancedScreenWrapper', 'ScreenContainer'].includes(
        elementName.name,
      );
    }
  }

  return false;
}

const buddyUiPackageExports = new Set([
  'Button',
  'Card',
  'FormField',
  'GlassSurface',
  'Input',
  'Label',
  'LoadingIndicator',
  'Switch',
  'Text',
  'ToggleField',
]);

const internalAppShellComponents = new Set(['SafeAreaWrapper', 'StandardKeyboardAvoidingView']);

function normalizeFilename(filename) {
  return filename.replace(/\\/g, '/');
}

function getImportedName(specifier) {
  if (specifier.type !== 'ImportSpecifier') return null;
  return specifier.imported.name ?? specifier.imported.value;
}

function isBuddyUiPackageFile(filename) {
  return normalizeFilename(filename).includes('/packages/buddy-ui/src/');
}

function isAppUiBarrel(filename) {
  return normalizeFilename(filename).endsWith('/src/components/ui/index.ts');
}

function isAppUiImplementation(filename) {
  return normalizeFilename(filename).includes('/src/components/ui/');
}

function sourceTargetsInternalAppShell(source) {
  return [...internalAppShellComponents].some((component) => source.endsWith(`/${component}`));
}

module.exports = {
  rules: {
    'enforce-screen-wrapper-usage': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent usage of ScreenWrapper and ScreenContainer components',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          useScreenWrapper:
            'Use ScreenWrapper or EnhancedScreenWrapper instead of direct View components for screen layouts',
          useScreenContainer: 'Use ScreenContainer for consistent screen container patterns',
          missingScreenWrapper:
            'Screen components should be wrapped with ScreenWrapper or EnhancedScreenWrapper',
          inconsistentScreenLayout: 'Use standardized screen layout components for consistency',
        },
      },
      create(context) {
        const filename = context.getFilename();
        const isScreenFile = filename.includes('/screens/') || filename.includes('/app/');

        return {
          // Check for direct View usage in screen files
          JSXElement(node) {
            if (!isScreenFile) return;

            if (
              node.openingElement.name.type === 'JSXIdentifier' &&
              node.openingElement.name.name === 'View'
            ) {
              // Check if this View is the root element of a screen component
              let parent = node.parent;
              let isRootView = false;

              while (parent) {
                if (parent.type === 'ReturnStatement') {
                  isRootView = true;
                  break;
                }
                if (parent.type === 'JSXElement') {
                  break;
                }
                parent = parent.parent;
              }

              if (isRootView) {
                context.report({
                  node,
                  messageId: 'useScreenWrapper',
                });
              }
            }
          },

          // Check for missing ScreenWrapper in screen components
          FunctionDeclaration(node) {
            if (!isScreenFile) return;

            if (node.id && node.id.name.includes('Screen')) {
              // Check if the function returns JSX with ScreenWrapper
              const returnStatement = node.body.body.find(
                (stmt) => stmt.type === 'ReturnStatement',
              );
              if (returnStatement && returnStatement.argument) {
                const hasScreenWrapper = checkForScreenWrapper(returnStatement.argument);
                if (!hasScreenWrapper) {
                  context.report({
                    node,
                    messageId: 'missingScreenWrapper',
                  });
                }
              }
            }
          },

          // Check arrow function components
          VariableDeclarator(node) {
            if (!isScreenFile) return;

            if (
              node.id &&
              node.id.name.includes('Screen') &&
              node.init &&
              node.init.type === 'ArrowFunctionExpression'
            ) {
              const body = node.init.body;
              if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
                const hasScreenWrapper = checkForScreenWrapper(body);
                if (!hasScreenWrapper) {
                  context.report({
                    node,
                    messageId: 'missingScreenWrapper',
                  });
                }
              }
            }
          },
        };
      },
    },

    'no-console-statements': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent new console.log statements in favor of centralized logging',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          noConsoleLog:
            'Use EnhancedLoggerService instead of console.log. Import from @/services/EnhancedLoggerService',
          noConsoleError: 'Use EnhancedLoggerService.error() instead of console.error',
          noConsoleWarn: 'Use EnhancedLoggerService.warn() instead of console.warn',
          noConsoleInfo: 'Use EnhancedLoggerService.info() instead of console.info',
          noConsoleDebug: 'Use EnhancedLoggerService.debug() instead of console.debug',
        },
      },
      create(context) {
        const consoleMethodMap = {
          log: 'noConsoleLog',
          error: 'noConsoleError',
          warn: 'noConsoleWarn',
          info: 'noConsoleInfo',
          debug: 'noConsoleDebug',
        };

        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.type === 'Identifier' &&
              node.callee.object.name === 'console' &&
              node.callee.property.type === 'Identifier'
            ) {
              const method = node.callee.property.name;
              const messageId = consoleMethodMap[method];

              if (messageId) {
                context.report({
                  node,
                  messageId,
                  fix(fixer) {
                    // Auto-fix to replace with EnhancedLoggerService
                    const methodMapping = {
                      log: 'debug',
                      error: 'error',
                      warn: 'warn',
                      info: 'info',
                      debug: 'debug',
                    };

                    const loggerMethod = methodMapping[method] || 'debug';
                    const args = node.arguments
                      .map((arg) => context.getSourceCode().getText(arg))
                      .join(', ');

                    return fixer.replaceText(
                      node,
                      `EnhancedLoggerService.${loggerMethod}(${args})`,
                    );
                  },
                });
              }
            }
          },
        };
      },
    },

    'enforce-tamagui-usage': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce Tamagui usage over hardcoded styles and React Native components',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          useDesignTokens: 'Use Tamagui design tokens instead of hardcoded values: {{suggestion}}',
          useTamaguiComponent:
            'Use Tamagui {{component}} component instead of React Native {{nativeComponent}}',
          avoidHardcodedStyles: 'Avoid hardcoded styles. Use Tamagui design tokens from the theme',
          useStackComponents:
            'Use XStack or YStack instead of View for better performance and consistency',
        },
      },
      create(context) {
        const hardcodedColorPattern = /#[0-9a-fA-F]{3,8}|rgb\(|rgba\(/;
        const componentMapping = {
          View: 'XStack or YStack',
          Text: 'Text (Tamagui)',
          TextInput: 'Input',
          TouchableOpacity: 'Button',
          ScrollView: 'ScrollView (Tamagui)',
        };
        const reactNativeComponents = new Map();
        const reactNativeStyleSheets = new Set();

        return {
          ImportDeclaration(node) {
            if (node.source.value !== 'react-native') return;

            node.specifiers.forEach((specifier) => {
              if (specifier.type !== 'ImportSpecifier') return;

              const importedName = specifier.imported.name ?? specifier.imported.value;
              const localName = specifier.local.name;

              if (componentMapping[importedName]) {
                reactNativeComponents.set(localName, importedName);
              }

              if (importedName === 'StyleSheet') {
                reactNativeStyleSheets.add(localName);
              }
            });
          },

          Property(node) {
            if (
              node.key &&
              node.key.type === 'Identifier' &&
              (node.key.name === 'color' ||
                node.key.name === 'backgroundColor' ||
                node.key.name === 'borderColor')
            ) {
              if (
                node.value.type === 'Literal' &&
                typeof node.value.value === 'string' &&
                hardcodedColorPattern.test(node.value.value)
              ) {
                context.report({
                  node,
                  messageId: 'useDesignTokens',
                  data: {
                    suggestion: 'Use theme colors like $color, $background, $primary, etc.',
                  },
                });
              }
            } else if (
              node.key &&
              node.key.type === 'Identifier' &&
              (node.key.name === 'padding' ||
                node.key.name === 'margin' ||
                node.key.name === 'paddingHorizontal' ||
                node.key.name === 'paddingVertical' ||
                node.key.name === 'marginHorizontal' ||
                node.key.name === 'marginVertical')
            ) {
              if (
                node.value.type === 'Literal' &&
                typeof node.value.value === 'number' &&
                node.value.value > 0
              ) {
                context.report({
                  node,
                  messageId: 'useDesignTokens',
                  data: {
                    suggestion: 'Use spacing tokens like $1, $2, $4, $8, etc.',
                  },
                });
              }
            }
          },

          // Check for React Native component usage
          JSXElement(node) {
            if (node.openingElement.name.type === 'JSXIdentifier') {
              const localName = node.openingElement.name.name;
              const componentName = reactNativeComponents.get(localName);

              if (!componentName) return;

              if (componentName === 'View') {
                context.report({
                  node,
                  messageId: 'useStackComponents',
                });
              } else if (componentMapping[componentName]) {
                context.report({
                  node,
                  messageId: 'useTamaguiComponent',
                  data: {
                    component: componentMapping[componentName],
                    nativeComponent: componentName,
                  },
                });
              }
            }
          },

          // Check for StyleSheet.create usage
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.type === 'Identifier' &&
              reactNativeStyleSheets.has(node.callee.object.name) &&
              node.callee.property.type === 'Identifier' &&
              node.callee.property.name === 'create'
            ) {
              context.report({
                node,
                messageId: 'avoidHardcodedStyles',
              });
            }
          },
        };
      },
    },

    'enforce-component-ownership': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce Buddy UI package, app UI, and feature component boundaries',
          category: 'Architecture',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          keepPackagePortable:
            'Buddy UI package source must remain app-independent. Move this dependency behind an app-owned component or pass it through props.',
          importPackageDirectly:
            '{{component}} is package-owned. Import it directly from @ravitamil/buddy-ui instead of the app UI barrel.',
          noPackageReExport:
            'The app UI barrel must not wrap or re-export Buddy UI package components. Consumers should import the package directly.',
          usePublicAppShell:
            '{{component}} is an internal app UI implementation detail. Compose ScreenWrapper or ScreenContainer instead.',
        },
      },
      create(context) {
        const filename = context.getFilename();
        const packageFile = isBuddyUiPackageFile(filename);
        const appUiFile = isAppUiImplementation(filename);

        function checkPortablePackageSource(node) {
          if (!packageFile || typeof node.source?.value !== 'string') return;

          const source = node.source.value;
          if (
            source.startsWith('@/') ||
            source === 'expo-router' ||
            source.includes('/context/') ||
            source.includes('/services/') ||
            source.includes('/screens/') ||
            source.includes('/features/')
          ) {
            context.report({node: node.source, messageId: 'keepPackagePortable'});
          }
        }

        return {
          ImportDeclaration(node) {
            checkPortablePackageSource(node);
            if (packageFile || typeof node.source.value !== 'string') return;

            const source = node.source.value;

            if (source === '@/components/ui') {
              node.specifiers.forEach((specifier) => {
                const importedName = getImportedName(specifier);
                if (!importedName || !buddyUiPackageExports.has(importedName)) return;

                context.report({
                  node: specifier,
                  messageId: 'importPackageDirectly',
                  data: {component: importedName},
                });
              });
            }

            const nonProductionFile = /(?:\.test|\.spec|\.stories)\.[jt]sx?$|\/__tests__\//.test(
              normalizeFilename(filename),
            );
            const targetsInternalAppShell = sourceTargetsInternalAppShell(source);

            if (!appUiFile && !nonProductionFile && targetsInternalAppShell) {
              context.report({
                node: node.source,
                messageId: 'usePublicAppShell',
                data: {component: source.split('/').at(-1)},
              });
            }

            if (!appUiFile && !nonProductionFile && !targetsInternalAppShell) {
              node.specifiers.forEach((specifier) => {
                const importedName = getImportedName(specifier);
                if (!importedName || !internalAppShellComponents.has(importedName)) return;

                context.report({
                  node: specifier,
                  messageId: 'usePublicAppShell',
                  data: {component: importedName},
                });
              });
            }
          },

          ExportNamedDeclaration(node) {
            checkPortablePackageSource(node);
            if (
              isAppUiBarrel(filename) &&
              typeof node.source?.value === 'string' &&
              node.source.value.startsWith('@ravitamil/buddy-ui')
            ) {
              context.report({node: node.source, messageId: 'noPackageReExport'});
            }
          },

          ExportAllDeclaration(node) {
            checkPortablePackageSource(node);
            if (
              isAppUiBarrel(filename) &&
              typeof node.source?.value === 'string' &&
              node.source.value.startsWith('@ravitamil/buddy-ui')
            ) {
              context.report({node: node.source, messageId: 'noPackageReExport'});
            }
          },
        };
      },
    },

    'no-raw-overlays': buddyUiEslint.rules['no-raw-overlays'],
    'prefer-buddy-ui-components': buddyUiEslint.rules['prefer-components'],

    'enforce-keyboard-avoiding-view': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Enforce app-owned ScreenWrapper keyboard handling instead of direct native adapters',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          useStandardKeyboardAvoidingView:
            'Use ScreenWrapper keyboard-aware behavior instead of importing KeyboardAvoidingView directly',
          inconsistentKeyboardHandling: 'Use ScreenWrapper keyboard handling patterns',
        },
      },
      create(context) {
        if (
          normalizeFilename(context.getFilename()).endsWith(
            '/src/components/ui/StandardKeyboardAvoidingView.tsx',
          )
        ) {
          return {};
        }

        return {
          JSXElement(node) {
            if (
              node.openingElement.name.type === 'JSXIdentifier' &&
              node.openingElement.name.name === 'KeyboardAvoidingView'
            ) {
              context.report({
                node,
                messageId: 'useStandardKeyboardAvoidingView',
              });
            }
          },
        };
      },
    },

    'enforce-form-field-usage': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce usage of StandardFormField for consistent form inputs',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          useStandardFormField:
            'Use FormField or Input from @ravitamil/buddy-ui instead of TextInput for consistent form behavior',
          inconsistentFormPattern: 'Use standardized form field patterns',
        },
      },
      create(context) {
        return {
          JSXElement(node) {
            if (
              node.openingElement.name.type === 'JSXIdentifier' &&
              node.openingElement.name.name === 'TextInput'
            ) {
              // Check if this is in a form context
              const filename = context.getFilename();
              const isFormFile =
                filename.includes('add-') ||
                filename.includes('edit-') ||
                filename.includes('form') ||
                filename.includes('input');

              if (isFormFile) {
                context.report({
                  node,
                  messageId: 'useStandardFormField',
                });
              }
            }
          },
        };
      },
    },
  },
};
