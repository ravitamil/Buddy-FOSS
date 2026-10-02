export type GradientColors = readonly [string, string, ...string[]];

interface DotLayoutOptions {
  width: number;
  height: number;
  dotSize: number;
  dotSpacing: number;
}

export interface DotLayoutItem {
  key: string;
  x: number;
  y: number;
}

export const createDotLayout = ({
  width,
  height,
  dotSize,
  dotSpacing,
}: DotLayoutOptions): DotLayoutItem[] => {
  const columns = Math.ceil((width + 100) / dotSpacing);
  const rows = Math.ceil((height + 200) / dotSpacing);
  const dots: DotLayoutItem[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      dots.push({
        key: `${row}-${column}`,
        x: column * dotSpacing + (dotSpacing - dotSize) / 2 - 50,
        y: row * dotSpacing + (dotSpacing - dotSize) / 2 - 100,
      });
    }
  }

  return dots;
};

export const resolveDottedBackgroundTheme = (
  isDarkMode: boolean,
  dotColor?: string,
  gradientColors?: GradientColors,
) => ({
  dotColor: dotColor ?? (isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'),
  gradientColors:
    gradientColors ??
    (isDarkMode
      ? (['#171613', '#171613', '#171613', '#171613'] as const)
      : (['#faf8f2', '#faf8f2', '#faf8f2', '#faf8f2'] as const)),
});
