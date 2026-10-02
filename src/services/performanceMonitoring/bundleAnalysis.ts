export const estimateBundleSize = (): number => {
  const baseSize = 2;
  const dependenciesSize = 5;
  const appCodeSize = 1;

  return baseSize + dependenciesSize + appCodeSize;
};
