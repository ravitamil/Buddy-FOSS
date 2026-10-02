import {createDotLayout, resolveDottedBackgroundTheme} from '../dottedBackgroundModel';

describe('dottedBackgroundModel', () => {
  it('creates centered dots across the extended viewport', () => {
    const dots = createDotLayout({
      width: 40,
      height: 20,
      dotSize: 2,
      dotSpacing: 20,
    });

    expect(dots).toHaveLength(77);
    expect(dots[0]).toEqual({key: '0-0', x: -41, y: -91});
    expect(dots[7]).toEqual({key: '1-0', x: -41, y: -71});
    expect(dots[76]).toEqual({key: '10-6', x: 79, y: 109});
  });

  it('uses overrides and theme-aware defaults', () => {
    const customGradient = ['#123456', '#abcdef'] as const;

    expect(resolveDottedBackgroundTheme(false)).toEqual({
      dotColor: 'rgba(0, 0, 0, 0.15)',
      gradientColors: ['#faf8f2', '#faf8f2', '#faf8f2', '#faf8f2'],
    });
    expect(resolveDottedBackgroundTheme(true)).toEqual({
      dotColor: 'rgba(255, 255, 255, 0.15)',
      gradientColors: ['#171613', '#171613', '#171613', '#171613'],
    });
    expect(resolveDottedBackgroundTheme(true, '#fff', customGradient)).toEqual({
      dotColor: '#fff',
      gradientColors: customGradient,
    });
  });
});
