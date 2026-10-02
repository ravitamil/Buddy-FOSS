import fs from 'fs';
import path from 'path';

const allowedFeatureHookRouteParamReaders = new Set([
  'src/features/groups/hooks/useAddGroupScreen.ts',
  'src/features/onboarding/hooks/useMultiStepOnboardingScreen.ts',
  'src/features/savings/hooks/useAddSavingsGoalScreen.ts',
  'src/features/savings/hooks/useCreateRetirementPlanScreen.ts',
  'src/features/subscriptions/hooks/useAddEditSubscriptionScreen.ts',
  'src/features/transactions/hooks/useAddTransactionScreenModel.ts',
  'src/features/transactions/hooks/useTransactionsScreenModel.ts',
]);

const walk = (directory: string): string[] => {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
};

const repoRelative = (filePath: string): string =>
  path.relative(process.cwd(), filePath).replace(/\\/g, '/');

describe('Expo Router boundaries', () => {
  it('keeps route param reads out of non-navigation feature hooks', () => {
    const hookFiles = walk(path.join(process.cwd(), 'src', 'features')).filter((filePath) => {
      const rel = repoRelative(filePath);
      return /\/hooks\/.*\.(ts|tsx)$/.test(rel) && !rel.includes('.test.');
    });

    const unexpectedReaders = hookFiles
      .filter((filePath) => fs.readFileSync(filePath, 'utf8').includes('useLocalSearchParams'))
      .map(repoRelative)
      .filter((filePath) => !allowedFeatureHookRouteParamReaders.has(filePath));

    expect(unexpectedReaders).toEqual([]);
  });
});
