import fs from 'fs';
import path from 'path';
import {authActionCoverage, mutationActionCoverage, actionDefinitions} from './matrix';
import {getRouteControlForPath} from './resolver';

const repoRoot = path.resolve(__dirname, '../../..');

const toPosix = (value: string) => value.replace(/\\/g, '/');

const collectFiles = (directory: string): string[] =>
  fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath);
    return fullPath;
  });

const routeFileToPath = (filePath: string): string | null => {
  const relative = toPosix(path.relative(repoRoot, filePath));
  if (!relative.startsWith('app/') || !relative.endsWith('.tsx')) return null;
  if (relative.endsWith('/_layout.tsx') || relative === 'app/_layout.tsx') return null;

  const withoutPrefix = relative.replace(/^app\//, '').replace(/\.tsx$/, '');
  const withoutGroups = withoutPrefix
    .split('/')
    .filter((segment) => !segment.startsWith('(') || !segment.endsWith(')'))
    .join('/');
  const withoutIndex = withoutGroups.replace(/\/index$/, '').replace(/^index$/, '');
  const dynamicAsSample = withoutIndex.replace(/\[[^\]]+\]/g, 'sample');

  return `/${dynamicAsSample}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
};

describe('feature control matrix coverage', () => {
  it('covers every Expo route with a feature route definition', () => {
    const routePaths = collectFiles(path.join(repoRoot, 'app'))
      .map(routeFileToPath)
      .filter((routePath): routePath is string => routePath !== null);

    const uncoveredRoutes = routePaths.filter((routePath) => !getRouteControlForPath(routePath));

    expect(uncoveredRoutes).toEqual([]);
  });

  it('keeps the guarded mutation inventory connected to real source commands', () => {
    const mutationFiles = collectFiles(path.join(repoRoot, 'src/features')).filter((filePath) =>
      filePath.endsWith('mutations.ts'),
    );
    const exportedHooks = mutationFiles.flatMap((filePath) => {
      const relative = toPosix(path.relative(repoRoot, filePath));
      const content = fs.readFileSync(filePath, 'utf8');
      return [...content.matchAll(/export function (use[A-Za-z0-9_]+)/g)].map(
        (match) => `${relative}:${match[1]}`,
      );
    });

    const coveredActions = new Set(actionDefinitions.map((definition) => definition.action));
    const uncoveredHooks = exportedHooks.filter((hook) => !(hook in mutationActionCoverage));
    const invalidActions = Object.values(mutationActionCoverage)
      .flat()
      .filter((action) => !coveredActions.has(action));

    const staleEntries = Object.entries(mutationActionCoverage).flatMap(
      ([sourceCommand, actions]) => {
        const separatorIndex = sourceCommand.lastIndexOf(':');
        const relativePath = sourceCommand.slice(0, separatorIndex);
        const symbol = sourceCommand.slice(separatorIndex + 1);
        const absolutePath = path.join(repoRoot, relativePath);
        if (!fs.existsSync(absolutePath)) return [sourceCommand];

        const content = fs.readFileSync(absolutePath, 'utf8');
        const missingSymbol = !content.includes(symbol);
        const missingActions = actions.some((action) => !content.includes(`'${action}'`));
        return missingSymbol || missingActions ? [sourceCommand] : [];
      },
    );

    expect(uncoveredHooks).toEqual([]);
    expect(invalidActions).toEqual([]);
    expect(staleEntries).toEqual([]);
  });

  it('covers every exported auth context and service action with a feature action', () => {
    const authTypesPath = path.join(repoRoot, 'src/types/auth-context.types.ts');
    const authTypesContent = fs.readFileSync(authTypesPath, 'utf8');
    const exportedAuthContextMethods = [
      ...authTypesContent.matchAll(/^\s{2}((?:signIn|verify|resend)[A-Za-z0-9]*|signOut): /gm),
    ].map((match) => `src/context/AuthContext.tsx:${match[1]}`);
    const unifiedAuthServicePath = path.join(repoRoot, 'src/services/UnifiedAuthService.ts');
    const unifiedAuthServiceContent = fs.readFileSync(unifiedAuthServicePath, 'utf8');
    const exportedAuthServiceMethods = [
      ...unifiedAuthServiceContent.matchAll(
        /public async ((?:signInWithEmail|verifyEmailOtp|resendEmailOtp|signInWithPhoneNumber|verifyOtp|resendOtp))\(/gm,
      ),
    ].map((match) => `src/services/UnifiedAuthService.ts:${match[1]}`);
    const exportedAuthMethods = [...exportedAuthContextMethods, ...exportedAuthServiceMethods];

    const coveredActions = new Set(actionDefinitions.map((definition) => definition.action));
    const uncoveredAuthMethods = exportedAuthMethods.filter(
      (method) => !(method in authActionCoverage),
    );
    const invalidActions = Object.values(authActionCoverage)
      .flat()
      .filter((action) => !coveredActions.has(action));

    expect(uncoveredAuthMethods).toEqual([]);
    expect(invalidActions).toEqual([]);
  });
});
