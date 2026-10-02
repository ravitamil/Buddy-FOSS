import fs from 'node:fs';
import path from 'node:path';

const readProjectFile = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('category form visual contract', () => {
  it('uses one lightweight composition for Create and Edit Category', () => {
    const form = readProjectFile('src/features/categories/components/CategoryFormSections.tsx');
    const iconEditor = readProjectFile('src/features/categories/components/CategoryIconEditor.tsx');
    const picker = readProjectFile('src/features/categories/components/CategoryColorPicker.tsx');
    const addScreen = readProjectFile('src/screenModules/AddCategoryScreen.tsx');
    const editFrame = readProjectFile(
      'src/features/categories/components/EditCategoryScreenFrame.tsx',
    );

    expect(form).toContain('showTypeSelector');
    expect(form).toContain('showColorPicker');
    expect(form).toContain('GlassSurface');
    expect(form).toContain('CategoryIconEditor');
    expect(form).toContain('onChangeEmoji');
    expect(iconEditor).toContain('CATEGORY_PRESETS');
    expect(iconEditor).toContain('category-icon-picker-button');
    expect(picker).toContain('showPalette ?');
    expect(picker).toContain('React.memo(function CategoryColorPicker');
    expect(picker).toContain('GlassSurface');
    expect(addScreen).toContain('CategoryFormSections');
    expect(addScreen).toContain('EmojiKeyboardSheet');
    expect(editFrame).toContain('CategoryFormSections');
    expect(editFrame).toContain('EmojiKeyboardSheet');
  });

  it('keeps category-form controls explicit, accessible, and touch-safe', () => {
    const form = readProjectFile('src/features/categories/components/CategoryFormSections.tsx');
    const iconEditor = readProjectFile('src/features/categories/components/CategoryIconEditor.tsx');
    const picker = readProjectFile('src/features/categories/components/CategoryColorPicker.tsx');

    expect(form).toContain('accessibilityLabel={`Select ${categoryType} category type`}');
    expect(form).toContain('minHeight={52}');
    expect(form).toContain('keyboardShouldPersistTaps="handled"');
    expect(iconEditor).toContain('category-icon-picker-button');
    expect(iconEditor).toContain('category-icon-edit-indicator');
    expect(picker).toContain('minWidth: 48');
    expect(picker).toContain('minHeight: 48');
    expect(picker).toContain('accessibilityState={{selected: selectedColor === color}}');
  });

  it('documents the form surface ownership', () => {
    const designSystem = readProjectFile('docs/fluid-surface-design-system.md');

    expect(designSystem).toContain('Create and Edit Category forms');
    expect(designSystem).toContain('Neutral form groups');
  });
});
