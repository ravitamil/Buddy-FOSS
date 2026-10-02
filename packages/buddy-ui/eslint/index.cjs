'use strict';

const componentReplacements = new Map([
  ['Button', 'Button'],
  ['Card', 'Card or GlassSurface'],
  ['Input', 'Input or FormField'],
  ['Label', 'Label or FormField'],
  ['Spinner', 'LoadingIndicator'],
  ['Switch', 'Switch or ToggleField'],
  ['Text', 'Text'],
]);

const rawOverlayComponents = new Set(['Adapt', 'Dialog', 'Sheet']);
const thirdPartyOverlayPackages = new Set([
  '@gorhom/bottom-sheet',
  'react-native-actions-sheet',
  'react-native-modal',
  'react-native-modalize',
  'react-native-raw-bottom-sheet',
]);

function normalizeFilename(filename) {
  return filename.replace(/\\/g, '/');
}

function getImportedName(specifier) {
  if (specifier.type !== 'ImportSpecifier') return null;
  return specifier.imported.name ?? specifier.imported.value;
}

function getMemberName(node) {
  if (node.property.type === 'Identifier' && !node.computed) return node.property.name;
  if (node.property.type === 'Literal' && typeof node.property.value === 'string') {
    return node.property.value;
  }
  return null;
}

function getJsxMemberName(node) {
  if (
    node.name.type !== 'JSXMemberExpression' ||
    node.name.object.type !== 'JSXIdentifier' ||
    node.name.property.type !== 'JSXIdentifier'
  ) {
    return null;
  }
  return {namespace: node.name.object.name, component: node.name.property.name};
}

function isBuddyUiPackageFile(filename) {
  return normalizeFilename(filename).includes('/packages/buddy-ui/src/');
}

function isNonProductionComponentFile(filename) {
  return /(?:\.test|\.spec|\.stories)\.[jt]sx?$|\/__tests__\//.test(normalizeFilename(filename));
}

const noRawOverlays = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Keep raw overlay infrastructure behind Buddy UI overlay contracts',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      useBuddyUiOverlay:
        'Overlay infrastructure is owned by @ravitamil/buddy-ui/overlays. Compose BottomSheet or Dialog instead of importing {{component}} from {{source}}.',
    },
  },
  create(context) {
    if (isBuddyUiPackageFile(context.getFilename())) return {};
    const tamaguiNamespaces = new Set();

    return {
      ImportDeclaration(node) {
        if (typeof node.source.value !== 'string') return;
        const source = node.source.value;

        if (source === 'tamagui') {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportNamespaceSpecifier') {
              tamaguiNamespaces.add(specifier.local.name);
              return;
            }
            const importedName = getImportedName(specifier);
            if (!importedName || !rawOverlayComponents.has(importedName)) return;

            context.report({
              node: specifier,
              messageId: 'useBuddyUiOverlay',
              data: {component: importedName, source},
            });
          });
        }

        if (source === 'react-native') {
          node.specifiers.forEach((specifier) => {
            if (getImportedName(specifier) !== 'Modal') return;
            context.report({
              node: specifier,
              messageId: 'useBuddyUiOverlay',
              data: {component: 'Modal', source},
            });
          });
        }

        if (thirdPartyOverlayPackages.has(source)) {
          context.report({
            node: node.source,
            messageId: 'useBuddyUiOverlay',
            data: {component: 'overlay primitives', source},
          });
        }
      },

      MemberExpression(node) {
        if (node.object.type !== 'Identifier' || !tamaguiNamespaces.has(node.object.name)) return;
        const component = getMemberName(node);
        if (!component || !rawOverlayComponents.has(component)) return;

        context.report({
          node,
          messageId: 'useBuddyUiOverlay',
          data: {component, source: 'tamagui'},
        });
      },

      JSXOpeningElement(node) {
        const member = getJsxMemberName(node);
        if (
          !member ||
          !tamaguiNamespaces.has(member.namespace) ||
          !rawOverlayComponents.has(member.component)
        ) {
          return;
        }

        context.report({
          node: node.name,
          messageId: 'useBuddyUiOverlay',
          data: {component: member.component, source: 'tamagui'},
        });
      },
    };
  },
};

const preferComponents = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Buddy UI branded components over direct Tamagui controls',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      useBuddyUiComponent:
        'Use {{replacement}} from @ravitamil/buddy-ui instead of Tamagui {{component}} so tokens, states, accessibility, and interaction behavior stay standardized.',
    },
  },
  create(context) {
    const filename = context.getFilename();
    if (isBuddyUiPackageFile(filename) || isNonProductionComponentFile(filename)) return {};
    const tamaguiNamespaces = new Set();

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'tamagui') return;

        node.specifiers.forEach((specifier) => {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            tamaguiNamespaces.add(specifier.local.name);
            return;
          }
          const importedName = getImportedName(specifier);
          const replacement = componentReplacements.get(importedName);
          if (!replacement) return;

          context.report({
            node: specifier,
            messageId: 'useBuddyUiComponent',
            data: {component: importedName, replacement},
          });
        });
      },

      MemberExpression(node) {
        if (node.object.type !== 'Identifier' || !tamaguiNamespaces.has(node.object.name)) return;
        const component = getMemberName(node);
        const replacement = componentReplacements.get(component);
        if (!component || !replacement) return;

        context.report({
          node,
          messageId: 'useBuddyUiComponent',
          data: {component, replacement},
        });
      },

      JSXOpeningElement(node) {
        const member = getJsxMemberName(node);
        if (!member || !tamaguiNamespaces.has(member.namespace)) return;
        const replacement = componentReplacements.get(member.component);
        if (!replacement) return;

        context.report({
          node: node.name,
          messageId: 'useBuddyUiComponent',
          data: {component: member.component, replacement},
        });
      },
    };
  },
};

const plugin = {
  meta: {name: '@ravitamil/buddy-ui', version: '0.1.0'},
  rules: {
    'no-raw-overlays': noRawOverlays,
    'prefer-components': preferComponents,
  },
  configs: {},
};

plugin.configs.recommended = {
  plugins: {'buddy-ui': plugin},
  rules: {
    'buddy-ui/no-raw-overlays': 'error',
    'buddy-ui/prefer-components': 'error',
  },
};

module.exports = plugin;
