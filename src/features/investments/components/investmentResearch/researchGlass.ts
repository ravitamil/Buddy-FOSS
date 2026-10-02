export const getGlassColors = (isDarkMode: boolean) =>
  isDarkMode
    ? (['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)'] as const)
    : (['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.05)'] as const);

export const getInactiveChipColors = (isDarkMode: boolean) =>
  isDarkMode
    ? (['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] as const)
    : (['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.05)'] as const);
