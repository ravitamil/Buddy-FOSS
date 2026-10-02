import {
  createAlphaColor,
  semanticHexColor,
  semanticColorToken,
  themedSurfaceColor,
} from '../uiTheme';

describe('uiTheme helpers', () => {
  it('maps semantic statuses to stable Tamagui color tokens', () => {
    expect(semanticColorToken('success')).toBe('$success');
    expect(semanticColorToken('warning')).toBe('$warning');
    expect(semanticColorToken('danger')).toBe('$error');
    expect(semanticColorToken('info')).toBe('$info');
  });

  it('maps semantic statuses to concrete icon-safe colors', () => {
    expect(semanticHexColor('success')).toBe('#146c35');
    expect(semanticHexColor('danger')).toBe('#b91c1c');
  });

  it('creates transparent colors from hex values', () => {
    expect(createAlphaColor('#3b82f6', 0.2)).toBe('rgba(59, 130, 246, 0.2)');
    expect(createAlphaColor('#fff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('returns light or dark surface colors without inline branching at call sites', () => {
    expect(themedSurfaceColor(true, 'muted')).toBe('rgba(255, 255, 255, 0.05)');
    expect(themedSurfaceColor(false, 'muted')).toBe('rgba(0, 0, 0, 0.02)');
    expect(themedSurfaceColor(true, 'glassBorder')).toBe('rgba(255, 255, 255, 0.12)');
  });
});
