import fs from 'node:fs';
import path from 'node:path';

const packageRoot = path.resolve(process.cwd(), 'packages/buddy-ui');
const sourceRoot = path.join(packageRoot, 'src');
const appSourceRoot = path.resolve(process.cwd(), 'src');

interface PackageManifest {
  name?: unknown;
  private?: unknown;
  files?: unknown;
  exports?: unknown;
}

const listSourceFiles = (directory: string): string[] =>
  fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? listSourceFiles(entryPath)
      : /\.(ts|tsx)$/.test(entry.name)
        ? [entryPath]
        : [];
  });

describe('@ravitamil/buddy-ui package boundary', () => {
  const sourceFiles = listSourceFiles(sourceRoot);

  it('does not import BuddyIO application state or product infrastructure', () => {
    const forbidden = [
      /from ['"]@\//,
      /expo-router/,
      /supabase/i,
      /featureControls/,
      /[/\\](context|services|features|assets)[/\\]/,
    ];
    const violations = sourceFiles.flatMap((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      return forbidden.some((pattern) => pattern.test(source))
        ? [path.relative(packageRoot, filePath)]
        : [];
    });

    expect(violations).toEqual([]);
  });

  it('uses named exports throughout the package', () => {
    const defaultExports = sourceFiles.flatMap((filePath) =>
      /\bexport\s+default\b/.test(fs.readFileSync(filePath, 'utf8'))
        ? [path.relative(packageRoot, filePath)]
        : [],
    );

    expect(defaultExports).toEqual([]);
  });

  it('keeps dialog accessibility and motion requirements in the package owner', () => {
    const source = fs.readFileSync(path.join(sourceRoot, 'overlays', 'Dialog.tsx'), 'utf8');

    expect(source).toContain('<TamaguiDialog.Title>{title}</TamaguiDialog.Title>');
    expect(source).toContain(
      '<TamaguiDialog.Description>{description}</TamaguiDialog.Description>',
    );
    expect(source).toContain('key="buddy-dialog-overlay"');
    expect(source).toContain('key="buddy-dialog-content"');
    expect(source).toContain('<Adapt when={true} platform="touch">');
    expect(source).toContain("animateOnly: ['transform', 'opacity']");
    expect(source).not.toMatch(/Platform\.OS/);
  });

  it('prevents feature code from owning raw sheet and dialog infrastructure', () => {
    const featureFiles = listSourceFiles(path.join(appSourceRoot, 'features'));
    const violations = featureFiles.flatMap((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      const importsRawOverlay =
        /import\s*\{[^}]*\b(?:Sheet|Dialog|Adapt)\b[^}]*\}\s*from\s*['"]tamagui['"]/.test(source) ||
        /import\s*\{[^}]*\bModal\b[^}]*\}\s*from\s*['"]react-native['"]/.test(source) ||
        /from\s*['"](?:@gorhom\/bottom-sheet|@expo\/react-native-action-sheet|react-native-modal)['"]/.test(
          source,
        ) ||
        /import\s*\{[^}]*\bAdaptiveSheet\b[^}]*\}\s*from\s*['"]@ravitamil\/buddy-ui\/overlays['"]/.test(
          source,
        );

      return importsRawOverlay ? [path.relative(process.cwd(), filePath)] : [];
    });

    expect(violations).toEqual([]);
  });

  it('publishes compiled entrypoints instead of source files', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'),
    ) as PackageManifest;

    expect(manifest.name).toBe('@ravitamil/buddy-ui');
    expect(manifest.private).toBe(false);
    expect(manifest.files).toEqual(['eslint', 'lib', 'README.md']);
    expect(JSON.stringify(manifest.exports)).toContain('./eslint');
    expect(JSON.stringify(manifest.exports)).not.toContain('./src/');
  });
});
