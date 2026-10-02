#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOTS = ['app', 'src', 'packages/buddy-ui/src'];
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];
const COMPONENT_DIRECTORY = `${path.sep}components${path.sep}`;
const UI_PACKAGE_DIRECTORY = path.join(ROOT, 'packages', 'buddy-ui', 'src');
const MARKDOWN_FLAG = '--markdown';
const CHECK_FLAG = '--check';
const SUMMARY_FLAG = '--summary';

function listSourceFiles(directory) {
  const absoluteDirectory = path.join(ROOT, directory);
  const entries = fs.readdirSync(absoluteDirectory, {withFileTypes: true});

  return entries.flatMap((entry) => {
    const entryPath = path.join(absoluteDirectory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : listSourceFiles(path.relative(ROOT, entryPath));
    }

    return SOURCE_EXTENSIONS.includes(path.extname(entry.name)) ? [entryPath] : [];
  });
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function isComponent(filePath) {
  return (
    path.extname(filePath) === '.tsx' &&
    (filePath.includes(COMPONENT_DIRECTORY) || filePath.startsWith(UI_PACKAGE_DIRECTORY)) &&
    !/\.(test|spec|stories)\.tsx$/.test(filePath)
  );
}

function fileRole(filePath) {
  if (
    /\.(test|spec)\.[jt]sx?$/.test(filePath) ||
    filePath.includes(`${path.sep}__tests__${path.sep}`)
  ) {
    return 'test';
  }

  return /\.stories\.[jt]sx?$/.test(filePath) ? 'story' : 'production';
}

function resolveFile(candidate) {
  const extensions = ['', ...SOURCE_EXTENSIONS];

  for (const extension of extensions) {
    const filePath = `${candidate}${extension}`;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }

  for (const extension of SOURCE_EXTENSIONS) {
    const indexPath = path.join(candidate, `index${extension}`);
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      return indexPath;
    }
  }

  for (const platform of ['native', 'android', 'ios', 'web']) {
    for (const extension of SOURCE_EXTENSIONS) {
      const platformPath = `${candidate}.${platform}${extension}`;
      if (fs.existsSync(platformPath) && fs.statSync(platformPath).isFile()) {
        return platformPath;
      }
    }
  }

  return null;
}

function resolveModule(fromFile, specifier) {
  if (specifier.startsWith('.')) {
    return resolveFile(path.resolve(path.dirname(fromFile), specifier));
  }

  if (specifier === '@ravitamil/buddy-ui') {
    return resolveFile(path.join(ROOT, 'packages/buddy-ui/src/index'));
  }

  if (specifier.startsWith('@ravitamil/buddy-ui/')) {
    return resolveFile(
      path.join(ROOT, 'packages/buddy-ui/src', specifier.slice('@ravitamil/buddy-ui/'.length)),
    );
  }

  if (specifier.startsWith('@/')) {
    return resolveFile(path.join(ROOT, 'src', specifier.slice(2)));
  }

  return null;
}

function platformVariants(filePath) {
  const match = filePath.match(/^(.*)\.(android|ios|native|web)\.(ts|tsx|js|jsx|cjs|mjs)$/);
  if (!match) {
    return [filePath];
  }

  const basePath = match[1];
  const variants = new Set([filePath]);
  for (const platform of ['native', 'android', 'ios', 'web']) {
    for (const extension of SOURCE_EXTENSIONS) {
      const candidate = `${basePath}.${platform}${extension}`;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        variants.add(candidate);
      }
    }
  }

  return [...variants];
}

function parseNamedBindings(clause) {
  const match = clause.match(/\{([\s\S]*?)\}/);
  if (!match) {
    return clause.trim().startsWith('* as') ? ['*'] : ['default'];
  }

  const bindings = match[1]
    .split(',')
    .map((binding) => binding.trim().replace(/^type\s+/, ''))
    .filter(Boolean)
    .map((binding) => binding.split(/\s+as\s+/)[0].trim());

  const defaultBinding = clause.slice(0, match.index).replace(',', '').trim();
  return defaultBinding && !defaultBinding.startsWith('type ')
    ? ['default', ...bindings]
    : bindings;
}

function parseModuleReferences(source) {
  const references = [];
  const fromPattern = /\bimport\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  const sideEffectPattern = /\bimport\s*['"]([^'"]+)['"]/g;
  const dynamicPattern = /\b(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;

  while ((match = fromPattern.exec(source))) {
    references.push({specifier: match[2], bindings: parseNamedBindings(match[1])});
  }

  while ((match = sideEffectPattern.exec(source))) {
    references.push({specifier: match[1], bindings: ['*']});
  }

  while ((match = dynamicPattern.exec(source))) {
    references.push({specifier: match[1], bindings: ['*']});
  }

  return references;
}

function directExports(source) {
  const names = new Set();
  const declarationPattern =
    /\bexport\s+(?:declare\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g;
  const exportListPattern = /\bexport\s*\{([\s\S]*?)\}(?!\s*from)/g;
  let match;

  while ((match = declarationPattern.exec(source))) {
    names.add(match[1]);
  }

  while ((match = exportListPattern.exec(source))) {
    for (const name of parseNamedBindings(`{${match[1]}}`)) {
      names.add(name);
    }
  }

  if (/\bexport\s+default\b/.test(source)) {
    names.add('default');
  }

  return names;
}

function reExportReferences(source) {
  const references = [];
  const explicitPattern = /\bexport\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]/g;
  const starPattern = /\bexport\s*\*\s*from\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = explicitPattern.exec(source))) {
    const entries = match[1]
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    references.push({
      specifier: match[2],
      explicit: entries.map((entry) => {
        const [sourceName, exportedName = sourceName] = entry
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/);
        return {sourceName: sourceName.trim(), exportedName: exportedName.trim()};
      }),
    });
  }

  while ((match = starPattern.exec(source))) {
    references.push({specifier: match[1], explicit: null});
  }

  return references;
}

function buildExportResolver(contents, resolveModuleReference = resolveModule) {
  const cache = new Map();

  function findTargets(filePath, exportName, visited = new Set()) {
    const cacheKey = `${filePath}:${exportName}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    if (visited.has(cacheKey) || !contents.has(filePath)) {
      return [];
    }

    const nextVisited = new Set(visited).add(cacheKey);
    const source = contents.get(filePath);
    const targets = new Set();

    if (directExports(source).has(exportName)) {
      targets.add(filePath);
    }

    for (const reference of reExportReferences(source)) {
      const targetFile = resolveModuleReference(filePath, reference.specifier);
      if (!targetFile) {
        continue;
      }

      if (reference.explicit) {
        for (const entry of reference.explicit) {
          if (entry.exportedName === exportName) {
            for (const target of findTargets(targetFile, entry.sourceName, nextVisited)) {
              targets.add(target);
            }
          }
        }
      } else if (exportName !== 'default') {
        for (const target of findTargets(targetFile, exportName, nextVisited)) {
          targets.add(target);
        }
      }
    }

    const resolvedTargets = [...targets];
    cache.set(cacheKey, resolvedTargets);
    return resolvedTargets;
  }

  return findTargets;
}

function collectPublicExportFiles(entryFiles, contents, resolveModuleReference = resolveModule) {
  const publicFiles = new Set();
  const pendingFiles = [...entryFiles];

  while (pendingFiles.length) {
    const filePath = pendingFiles.pop();
    if (!filePath || publicFiles.has(filePath) || !contents.has(filePath)) {
      continue;
    }

    publicFiles.add(filePath);
    for (const reference of reExportReferences(contents.get(filePath))) {
      const targetFile = resolveModuleReference(filePath, reference.specifier);
      if (targetFile && !publicFiles.has(targetFile)) {
        pendingFiles.push(targetFile);
      }
    }
  }

  return publicFiles;
}

function exportTargets(value) {
  if (typeof value === 'string') {
    return [value];
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.values(value).flatMap(exportTargets);
}

function packageSourceTarget(packageDirectory, target) {
  if (typeof target !== 'string' || !target.startsWith('./lib/')) {
    return null;
  }

  const sourceRelativePath = target
    .replace(/^\.\/lib\/(?:module|commonjs)\//, '')
    .replace(/^\.\/lib\/typescript\/(?:module|commonjs)\//, '')
    .replace(/\.d\.ts$/, '')
    .replace(/\.js$/, '');

  return resolveFile(path.join(packageDirectory, 'src', sourceRelativePath));
}

function packagePublicFiles(contents) {
  const packageDirectory = path.join(ROOT, 'packages', 'buddy-ui');
  const packageManifest = JSON.parse(
    fs.readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'),
  );
  const entryFiles = exportTargets(packageManifest.exports)
    .map(
      (target) =>
        packageSourceTarget(packageDirectory, target) ??
        resolveFile(path.join(packageDirectory, target)),
    )
    .filter(Boolean);

  return collectPublicExportFiles(entryFiles, contents);
}

function formatEvidence(consumers) {
  return consumers
    .slice(0, 3)
    .map((consumer) => relativePath(consumer))
    .join(', ');
}

function audit() {
  const sourceFiles = SOURCE_ROOTS.flatMap(listSourceFiles);
  const contents = new Map(
    sourceFiles.map((filePath) => [filePath, fs.readFileSync(filePath, 'utf8')]),
  );
  const findExportTargets = buildExportResolver(contents);
  const publicPackageFiles = packagePublicFiles(contents);
  const inbound = new Map();

  for (const sourceFile of sourceFiles) {
    for (const reference of parseModuleReferences(contents.get(sourceFile))) {
      const moduleFile = resolveModule(sourceFile, reference.specifier);
      if (!moduleFile || !contents.has(moduleFile)) {
        continue;
      }

      const targets = new Set();
      for (const moduleVariant of platformVariants(moduleFile)) {
        if (!contents.has(moduleVariant)) {
          continue;
        }

        if (isComponent(moduleVariant)) {
          targets.add(moduleVariant);
        }
        for (const binding of reference.bindings) {
          if (binding === '*') {
            targets.add(moduleVariant);
          } else {
            for (const target of findExportTargets(moduleVariant, binding)) {
              targets.add(target);
            }
          }
        }
      }

      for (const target of targets) {
        if (!inbound.has(target)) {
          inbound.set(target, {production: new Set(), test: new Set(), story: new Set()});
        }
        inbound.get(target)[fileRole(sourceFile)].add(sourceFile);
      }
    }
  }

  for (const componentFile of sourceFiles.filter(isComponent)) {
    const platformMatch = componentFile.match(/\.(android|ios|native|web)\.tsx$/);
    if (!platformMatch) {
      continue;
    }

    const platformAgnosticPath = componentFile.replace(/\.(android|ios|native|web)\.tsx$/, '');
    const siblingConsumers = ['android', 'ios', 'native', 'web']
      .map((platform) => inbound.get(`${platformAgnosticPath}.${platform}.tsx`))
      .filter(Boolean);

    if (!siblingConsumers.length) {
      continue;
    }

    const mergedConsumers = {production: new Set(), test: new Set(), story: new Set()};
    for (const consumers of siblingConsumers) {
      for (const role of Object.keys(mergedConsumers)) {
        for (const consumer of consumers[role]) {
          mergedConsumers[role].add(consumer);
        }
      }
    }
    inbound.set(componentFile, mergedConsumers);
  }

  return sourceFiles
    .filter(isComponent)
    .map((filePath) => {
      const consumers = inbound.get(filePath) ?? {
        production: new Set(),
        test: new Set(),
        story: new Set(),
      };
      const publicApi = publicPackageFiles.has(filePath);
      const status = consumers.production.size || publicApi
        ? 'active'
        : consumers.test.size
          ? 'test-only'
          : consumers.story.size
            ? 'story-only'
            : 'unreachable';

      return {
        component: relativePath(filePath),
        status,
        publicApi,
        production: [...consumers.production].sort(),
        test: [...consumers.test].sort(),
        story: [...consumers.story].sort(),
      };
    })
    .sort((left, right) => left.component.localeCompare(right.component));
}

function printMarkdown(results) {
  console.log('| Component | Classification | Production reach | Non-production reach |');
  console.log('| --- | --- | --- | --- |');
  for (const result of results) {
    const production = formatEvidence(result.production) || (result.publicApi ? 'package API' : '—');
    const nonProduction = formatEvidence([...result.test, ...result.story]) || '—';
    console.log(
      `| \`${result.component}\` | ${result.status} | ${production} | ${nonProduction} |`,
    );
  }
}

function printSummary(results) {
  const counts = results.reduce(
    (summary, result) => ({...summary, [result.status]: summary[result.status] + 1}),
    {active: 0, 'test-only': 0, 'story-only': 0, unreachable: 0},
  );

  console.log(
    `active: ${counts.active}; test-only: ${counts['test-only']}; story-only: ${counts['story-only']}; unreachable: ${counts.unreachable}`,
  );
}

if (require.main === module) {
  const results = audit();

  if (process.argv.includes(MARKDOWN_FLAG)) {
    printMarkdown(results);
  } else if (process.argv.includes(SUMMARY_FLAG)) {
    printSummary(results);
  } else {
    console.log(JSON.stringify(results, null, 2));
  }

  const unreachable = results.filter((result) => result.status === 'unreachable');
  console.error(
    `Audited ${results.length} component files; ${unreachable.length} are unreachable.`,
  );

  if (process.argv.includes(CHECK_FLAG) && unreachable.length) {
    process.exitCode = 1;
  }
}

module.exports = {
  audit,
  buildExportResolver,
  collectPublicExportFiles,
  directExports,
  parseModuleReferences,
  packageSourceTarget,
  reExportReferences,
  resolveModule,
};
