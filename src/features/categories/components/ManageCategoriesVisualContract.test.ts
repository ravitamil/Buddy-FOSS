import fs from 'node:fs';
import path from 'node:path';

const readProjectFile = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Manage Categories visual contract', () => {
  it('uses the app-wide glass language without feature-local glass recipes', () => {
    const primitives = readProjectFile(
      'src/features/categories/components/ManageCategoryPrimitives.tsx',
    );
    const controls = readProjectFile(
      'src/features/categories/components/ManageCategoryControls.tsx',
    );

    expect(primitives).toContain('GlassSurfaceProps');
    expect(primitives).toContain("from '@ravitamil/buddy-ui'");
    expect(primitives).not.toContain("from '@/components/ui'");
    expect(primitives).not.toContain("from '@ravitamil/buddy-ui/mobile'");
    expect(controls).toContain('GlassSurface');
    expect(controls).not.toContain('isDarkMode');
  });

  it('virtualizes the complete screen and keeps the add action in the thumb zone', () => {
    const frame = readProjectFile(
      'src/features/categories/components/ManageCategoriesScreenFrame.tsx',
    );
    const sections = readProjectFile(
      'src/features/categories/components/ManageCategorySections.tsx',
    );

    expect(frame).toContain('presentation="circular"');
    expect(frame).toContain('label="Add category"');
    expect(frame).not.toContain('Animated.ScrollView');
    expect(sections).toContain(
      'Animated.createAnimatedComponent(FlashList<ManageCategoryListItem>)',
    );
    expect(sections).toContain('getItemType');
  });

  it('keeps row actions accessible and preserves protected-category behavior', () => {
    const rows = readProjectFile('src/features/categories/components/ManageCategoryRows.tsx');

    expect(rows).toContain('minWidth={48}');
    expect(rows).toContain('minHeight={48}');
    expect(rows).toContain('accessibilityLabel={`Edit ${name} category`}');
    expect(rows).toContain('accessibilityLabel={`Delete ${name} category`}');
    expect(rows).toContain('Protected');
    expect(rows).not.toContain('â€¢');
  });

  it('documents Manage Categories as a scoped target-surface migration', () => {
    const designSystem = readProjectFile('docs/fluid-surface-design-system.md');

    expect(designSystem).toContain('Manage Categories');
    expect(designSystem).toContain('Target design adopted');
  });
});
