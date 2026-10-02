import {getFAQBorderColor, getFAQGradientColors, getPlatformLabel} from './helpSupportPresentation';

describe('helpSupportPresentation', () => {
  it('creates expanded FAQ colors for both themes', () => {
    expect(getFAQGradientColors(true, true)).toEqual([
      'rgba(59, 130, 246, 0.2)',
      'rgba(37, 99, 235, 0.3)',
    ]);
    expect(getFAQGradientColors(false, true)).toEqual([
      'rgba(59, 130, 246, 0.15)',
      'rgba(37, 99, 235, 0.2)',
    ]);
    expect(getFAQBorderColor(true, true)).toBe('rgba(59, 130, 246, 0.4)');
    expect(getFAQBorderColor(false, true)).toBe('rgba(59, 130, 246, 0.3)');
  });

  it('creates collapsed FAQ colors for both themes', () => {
    expect(getFAQGradientColors(true, false)).toEqual([
      'rgba(255, 255, 255, 0.05)',
      'rgba(255, 255, 255, 0.01)',
    ]);
    expect(getFAQGradientColors(false, false)).toEqual([
      'rgba(255, 255, 255, 0.12)',
      'rgba(255, 255, 255, 0.05)',
    ]);
    expect(getFAQBorderColor(true, false)).toBe('rgba(255, 255, 255, 0.08)');
    expect(getFAQBorderColor(false, false)).toBe('rgba(255, 255, 255, 0.15)');
  });

  it('maps native platform names for app information', () => {
    expect(getPlatformLabel('ios')).toBe('iOS');
    expect(getPlatformLabel('android')).toBe('Android');
  });
});
