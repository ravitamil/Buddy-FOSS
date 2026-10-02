import {
  createBuddyUIThemes,
  defaultBuddyBrandPalette,
  mobileControlSizes,
} from '@ravitamil/buddy-ui/theme';
import {resolveThemeColor} from '@ravitamil/buddy-ui/utils';

describe('mobile design-system foundations', () => {
  it('uses platform-safe minimum touch targets', () => {
    expect(mobileControlSizes.iosMinimumTouchTarget).toBeGreaterThanOrEqual(44);
    expect(mobileControlSizes.androidMinimumTouchTarget).toBeGreaterThanOrEqual(48);
  });

  it('uses one brand accent while keeping semantic colors separate', () => {
    const themes = createBuddyUIThemes();

    expect(themes.light.primary).toBe(defaultBuddyBrandPalette.primary);
    expect(themes.dark.primary).toBe(defaultBuddyBrandPalette.primary);
    expect(themes.light.error).not.toBe(themes.light.primary);
  });

  it('owns the canonical glass colors as portable theme roles', () => {
    const themes = createBuddyUIThemes();

    expect(themes.light.glassSurfaceStart).toBe('rgba(255, 255, 255, 0.90)');
    expect(themes.light.glassSurfaceBorder).toBe('rgba(255, 255, 255, 0.90)');
    expect(themes.dark.glassSurfaceStart).toBe('rgba(255, 255, 255, 0.075)');
    expect(themes.dark.glassSurfaceFill).toBe('rgba(255, 255, 255, 0.012)');
    expect(themes.dark.glassSurfaceBorder).toBe('rgba(255, 255, 255, 0.38)');
  });

  it('allows future apps to supply their own brand palette', () => {
    const themes = createBuddyUIThemes({
      brand: {
        primary: '#155e75',
        primaryHover: '#164e63',
        primaryPress: '#083344',
      },
    });

    expect(themes.light.primary).toBe('#155e75');
    expect(themes.dark.primaryHover).toBe('#164e63');
  });

  it('allows future apps to override surfaces, semantic states, and glass independently', () => {
    const themes = createBuddyUIThemes({
      palette: {light: {background: '#faf5ff'}},
      semantic: {dark: {warning: '#fde047'}},
      glass: {light: {border: 'rgba(88, 28, 135, 0.28)'}},
    });

    expect(themes.light.background).toBe('#faf5ff');
    expect(themes.dark.warning).toBe('#fde047');
    expect(themes.light.glassSurfaceBorder).toBe('rgba(88, 28, 135, 0.28)');
  });

  it('resolves Tamagui theme tokens without leaking token internals to components', () => {
    expect(resolveThemeColor({primary: {val: '#047857'}}, 'primary', '#000000')).toBe('#047857');
    expect(
      resolveThemeColor(
        {buttonPrimaryText: {val: '$white'}, white: {val: '#ffffff'}},
        'buttonPrimaryText',
        '#000000',
      ),
    ).toBe('#ffffff');
    expect(resolveThemeColor({}, 'primary', '#000000')).toBe('#000000');
  });
});
