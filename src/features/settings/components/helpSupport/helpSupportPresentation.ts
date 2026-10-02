export function getFAQGradientColors(isDarkMode: boolean, isExpanded: boolean): [string, string] {
  if (isExpanded) {
    return isDarkMode
      ? ['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.3)']
      : ['rgba(59, 130, 246, 0.15)', 'rgba(37, 99, 235, 0.2)'];
  }

  return isDarkMode
    ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']
    : ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.05)'];
}

export function getFAQBorderColor(isDarkMode: boolean, isExpanded: boolean) {
  if (isExpanded) {
    return isDarkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)';
  }

  return isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)';
}

export function getPlatformLabel(platform: string) {
  return platform === 'ios' ? 'iOS' : 'Android';
}
