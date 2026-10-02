import {TextDecoder, TextEncoder} from 'node:util';
import {Linter, type Rule} from 'eslint';

import developmentQuality from '../../eslint-rules/development-quality';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const enforceTamaguiUsageRule = developmentQuality.rules[
  'enforce-tamagui-usage'
] as Rule.RuleModule;
const enforceComponentOwnershipRule = developmentQuality.rules[
  'enforce-component-ownership'
] as Rule.RuleModule;
const noRawOverlaysRule = developmentQuality.rules['no-raw-overlays'] as Rule.RuleModule;
const preferBuddyUiComponentsRule = developmentQuality.rules[
  'prefer-buddy-ui-components'
] as Rule.RuleModule;

const verify = (
  code: string,
  rule: Rule.RuleModule = enforceTamaguiUsageRule,
  filename = 'Example.jsx',
) => {
  const linter = new Linter();

  return linter.verify(
    code,
    [
      {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
          local: {
            rules: {rule},
          },
        },
        languageOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          parserOptions: {ecmaFeatures: {jsx: true}},
        },
        rules: {'local/rule': 'warn'},
      },
    ],
    {filename},
  );
};

describe('enforce-tamagui-usage', () => {
  it('ignores components that are already owned by Tamagui or Buddy UI', () => {
    const messages = verify(`
      import {Text} from '@ravitamil/buddy-ui';
      import {ScrollView, View} from 'tamagui';

      export const Example = () => <ScrollView><View><Text>Ready</Text></View></ScrollView>;
    `);

    expect(messages).toEqual([]);
  });

  it('reports React Native primitives, including aliased imports', () => {
    const messages = verify(`
      import {ScrollView, Text as NativeText, View} from 'react-native';
      export const Example = () => <ScrollView><View><NativeText>Legacy</NativeText></View></ScrollView>;
    `);

    expect(messages.map(({messageId}) => messageId)).toEqual([
      'useTamaguiComponent',
      'useStackComponents',
      'useTamaguiComponent',
    ]);
  });
});

describe('enforce-component-ownership', () => {
  it('allows features to compose package components and app-owned composites', () => {
    const messages = verify(
      `
        import {Button, Text} from '@ravitamil/buddy-ui';
        import {BottomSheet} from '@ravitamil/buddy-ui/overlays';
        import {ScreenContainer} from '@/components/ui';

        export const Example = () => null;
      `,
      enforceComponentOwnershipRule,
      'F:/prj/Buddy/src/features/example/components/Example.jsx',
    );

    expect(messages).toEqual([]);
  });

  it('rejects raw and third-party overlay infrastructure outside Buddy UI', () => {
    const rawMessages = verify(
      `
        import {Adapt, Dialog as RawDialog, Sheet} from 'tamagui';
        import {Modal} from 'react-native';
        import BottomSheet from '@gorhom/bottom-sheet';
      `,
      noRawOverlaysRule,
      'F:/prj/Buddy/src/features/example/components/Example.jsx',
    );

    expect(rawMessages.map(({messageId}) => messageId)).toEqual([
      'useBuddyUiOverlay',
      'useBuddyUiOverlay',
      'useBuddyUiOverlay',
      'useBuddyUiOverlay',
      'useBuddyUiOverlay',
    ]);
  });

  it('rejects raw overlays accessed through a Tamagui namespace', () => {
    const messages = verify(
      `
        import * as Tamagui from 'tamagui';
        export const Example = () => <Tamagui.Sheet />;
      `,
      noRawOverlaysRule,
      'F:/prj/Buddy/src/features/example/components/Example.jsx',
    );

    expect(messages.map(({messageId}) => messageId)).toEqual(['useBuddyUiOverlay']);
  });

  it('keeps package source independent from BuddyIO application layers', () => {
    const messages = verify(
      `
        import {useGroups} from '@/context';
        export {SettingsScreen} from '@/screens/SettingsScreen';
      `,
      enforceComponentOwnershipRule,
      'F:/prj/Buddy/packages/buddy-ui/src/Invalid.jsx',
    );

    expect(messages.map(({messageId}) => messageId)).toEqual([
      'keepPackagePortable',
      'keepPackagePortable',
    ]);
  });

  it('keeps package components out of the app UI barrel', () => {
    const messages = verify(
      `export {Button, Text} from '@ravitamil/buddy-ui';`,
      enforceComponentOwnershipRule,
      'F:/prj/Buddy/src/components/ui/index.ts',
    );

    expect(messages.map(({messageId}) => messageId)).toEqual(['noPackageReExport']);
  });

  it('requires package-owned components to be imported from the package', () => {
    const messages = verify(
      `import {Button, ScreenContainer, Text as AppText} from '@/components/ui';`,
      enforceComponentOwnershipRule,
      'F:/prj/Buddy/src/features/example/components/Example.jsx',
    );

    expect(messages.map(({messageId}) => messageId)).toEqual([
      'importPackageDirectly',
      'importPackageDirectly',
    ]);
  });

  it('keeps internal app shell adapters inside the app UI layer', () => {
    const messages = verify(
      `import StandardKeyboardAvoidingView from '@/components/ui/StandardKeyboardAvoidingView';`,
      enforceComponentOwnershipRule,
      'F:/prj/Buddy/src/features/example/components/Example.jsx',
    );

    expect(messages.map(({messageId}) => messageId)).toEqual(['usePublicAppShell']);
  });
});

describe('prefer-buddy-ui-components', () => {
  it('reports direct Tamagui branded controls, including aliases', () => {
    const messages = verify(
      `
        import {Button as TamaguiButton, Input, Spinner, Switch, Text} from 'tamagui';
        import {ScrollView, XStack, YStack, styled, useTheme} from 'tamagui';
      `,
      preferBuddyUiComponentsRule,
      'F:/prj/Buddy/src/features/example/components/Example.jsx',
    );

    expect(messages.map(({messageId}) => messageId)).toEqual([
      'useBuddyUiComponent',
      'useBuddyUiComponent',
      'useBuddyUiComponent',
      'useBuddyUiComponent',
      'useBuddyUiComponent',
    ]);
  });

  it('allows raw Tamagui controls inside the reusable Buddy UI package', () => {
    const messages = verify(
      `import {Button, Input, Spinner, Switch, Text} from 'tamagui';`,
      preferBuddyUiComponentsRule,
      'F:/prj/Buddy/packages/buddy-ui/src/Example.jsx',
    );

    expect(messages).toEqual([]);
  });

  it('reports branded controls accessed through a Tamagui namespace', () => {
    const messages = verify(
      `
        import * as Tamagui from 'tamagui';
        export const Example = () => <Tamagui.Text>Ready</Tamagui.Text>;
      `,
      preferBuddyUiComponentsRule,
      'F:/prj/Buddy/src/features/example/components/Example.jsx',
    );

    expect(messages.map(({messageId}) => messageId)).toEqual(['useBuddyUiComponent']);
  });
});
