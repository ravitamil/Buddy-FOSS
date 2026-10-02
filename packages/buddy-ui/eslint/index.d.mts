interface BuddyUiRuleModule {
  readonly meta: {
    readonly type: 'problem' | 'suggestion';
    readonly docs: {
      readonly description: string;
      readonly recommended: boolean;
    };
    readonly fixable: null;
    readonly schema: readonly unknown[];
    readonly messages: Readonly<Record<string, string>>;
  };
  create(context: unknown): Readonly<Record<string, (node: unknown) => void>>;
}

interface BuddyUiFlatConfig {
  readonly plugins: {'buddy-ui': BuddyUiEslintPlugin};
  readonly rules: {
    readonly 'buddy-ui/no-raw-overlays': 'error';
    readonly 'buddy-ui/prefer-components': 'error';
  };
}

interface BuddyUiEslintPlugin {
  readonly meta: {readonly name: string; readonly version: string};
  readonly rules: {
    readonly 'no-raw-overlays': BuddyUiRuleModule;
    readonly 'prefer-components': BuddyUiRuleModule;
  };
  readonly configs: {readonly recommended: BuddyUiFlatConfig};
}

declare const buddyUiEslintPlugin: BuddyUiEslintPlugin;

export default buddyUiEslintPlugin;
