const {
  buildExportResolver,
  collectPublicExportFiles,
  packageSourceTarget,
  parseModuleReferences,
} = require('../../scripts/audit-component-reachability');

const createResolver = (sources, modules) => {
  const contents = new Map(Object.entries(sources));
  const resolveModule = (fromFile, specifier) => modules[`${fromFile}:${specifier}`] ?? null;

  return buildExportResolver(contents, resolveModule);
};

describe('component reachability export resolution', () => {
  it('follows only the matching binding through star barrels', () => {
    const findTargets = createResolver(
      {
        'index.ts': "export * from './Alpha';\nexport * from './Beta';",
        'Alpha.tsx': 'export function Alpha() { return null; }',
        'Beta.tsx': 'export function Beta() { return null; }',
      },
      {
        'index.ts:./Alpha': 'Alpha.tsx',
        'index.ts:./Beta': 'Beta.tsx',
      },
    );

    expect(findTargets('index.ts', 'Alpha')).toEqual(['Alpha.tsx']);
    expect(findTargets('index.ts', 'Missing')).toEqual([]);
  });

  it('resolves explicit aliases and default re-exports', () => {
    const findTargets = createResolver(
      {
        'index.ts': "export {default as PrimaryButton} from './Button';",
        'Button.tsx': 'export default function Button() { return null; }',
      },
      {'index.ts:./Button': 'Button.tsx'},
    );

    expect(findTargets('index.ts', 'PrimaryButton')).toEqual(['Button.tsx']);
    expect(findTargets('index.ts', 'Button')).toEqual([]);
  });

  it('does not forward default exports through export star', () => {
    const findTargets = createResolver(
      {
        'index.ts': "export * from './Button';",
        'Button.tsx': 'export default function Button() { return null; }',
      },
      {'index.ts:./Button': 'Button.tsx'},
    );

    expect(findTargets('index.ts', 'default')).toEqual([]);
  });

  it('terminates safely when barrels form a cycle', () => {
    const findTargets = createResolver(
      {
        'a.ts': "export * from './b';",
        'b.ts': "export * from './a';",
      },
      {
        'a.ts:./b': 'b.ts',
        'b.ts:./a': 'a.ts',
      },
    );

    expect(findTargets('a.ts', 'Missing')).toEqual([]);
  });
});

describe('package public API resolution', () => {
  it('maps compiled manifest targets back to package source', () => {
    expect(
      packageSourceTarget(
        `${process.cwd()}/packages/buddy-ui`,
        './lib/typescript/module/ToastBanner.d.ts',
      ),
    ).toMatch(/packages[\\/]buddy-ui[\\/]src[\\/]ToastBanner\.tsx$/);
  });

  it('treats only files reachable from declared entrypoints as public', () => {
    const contents = new Map([
      ['index.ts', "export * from './Card';"],
      ['Card.tsx', 'export function Card() { return null; }'],
      ['Internal.tsx', 'export function Internal() { return null; }'],
    ]);
    const modules = {'index.ts:./Card': 'Card.tsx'};
    const publicFiles = collectPublicExportFiles(
      ['index.ts'],
      contents,
      (fromFile, specifier) => modules[`${fromFile}:${specifier}`] ?? null,
    );

    expect([...publicFiles]).toEqual(expect.arrayContaining(['index.ts', 'Card.tsx']));
    expect(publicFiles.has('Internal.tsx')).toBe(false);
  });
});

describe('component reachability reference parsing', () => {
  it('captures named, aliased, dynamic, require, and side-effect imports', () => {
    const references = parseModuleReferences(`
      import DefaultThing, {Alpha as LocalAlpha, type Beta} from './named';
      import './side-effect';
      const LazyThing = import('./lazy');
      const RequiredThing = require('./required');
    `);

    expect(references).toEqual(
      expect.arrayContaining([
        {specifier: './named', bindings: ['default', 'Alpha', 'Beta']},
        {specifier: './side-effect', bindings: ['*']},
        {specifier: './lazy', bindings: ['*']},
        {specifier: './required', bindings: ['*']},
      ]),
    );
  });
});
