import {TextDecoder, TextEncoder} from 'node:util';
import {Linter, type Rule} from 'eslint';

import contextPatterns from '../../eslint-rules/context-patterns';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const deprecationWarningsRule = contextPatterns.rules['deprecation-warnings'] as Rule.RuleModule;

const verify = (code: string) => {
  const linter = new Linter();

  return linter.verify(
    code,
    [
      {
        files: ['**/*.js'],
        plugins: {
          local: {
            rules: {'deprecation-warnings': deprecationWarningsRule},
          },
        },
        languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
        rules: {'local/deprecation-warnings': 'warn'},
      },
    ],
    {filename: 'Example.js'},
  );
};

describe('deprecation-warnings', () => {
  it('does not flag supported currency formatters or Object prototype methods', () => {
    const messages = verify(`
      settings.formatCurrency(42);
      amount.toLocaleString();
    `);

    expect(messages).toEqual([]);
  });

  it('still reports explicitly deprecated context methods', () => {
    const messages = verify('groups.addGroup(input);');

    expect(messages).toHaveLength(1);
    expect(messages[0].messageId).toBe('deprecatedMethod');
  });
});
