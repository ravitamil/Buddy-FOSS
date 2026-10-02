#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {createClient} = require('@supabase/supabase-js');

const repoRoot = path.resolve(__dirname, '..', '..');
const defaultConfigPath = path.join(repoRoot, 'supabase', 'feature-controls.json');
const featureTypesPath = path.join(repoRoot, 'src', 'features', 'featureControls', 'types.ts');
const featureMatrixPath = path.join(repoRoot, 'src', 'features', 'featureControls', 'matrix.ts');
const validPlatforms = new Set(['all', 'android', 'ios']);

function print(message = '') {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`Feature controls apply failed: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    filePath: null,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }

    if (!args.filePath) {
      args.filePath = arg;
      continue;
    }

    fail(`Unexpected argument: ${arg}`);
  }

  args.filePath = path.resolve(process.cwd(), args.filePath || defaultConfigPath);
  return args;
}

function printUsage() {
  print('Usage: node scripts/admin/apply-feature-controls.js [--dry-run] [config.json]');
  print('');
  print('Environment:');
  print('  SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL');
  print('  SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY');
}

function readText(relativeOrAbsolutePath) {
  return fs.readFileSync(relativeOrAbsolutePath, 'utf8');
}

function extractUnionValues(source, typeName) {
  const pattern = new RegExp(`export type ${typeName} =[\\s\\S]*?;`, 'u');
  const match = source.match(pattern);
  if (!match) {
    fail(`Could not find ${typeName} in ${path.relative(repoRoot, featureTypesPath)}`);
  }

  return new Set([...match[0].matchAll(/'([^']+)'/gu)].map((valueMatch) => valueMatch[1]));
}

function loadRuntimeMatrix() {
  const typesSource = readText(featureTypesPath);
  const matrixSource = readText(featureMatrixPath);
  const featureKeys = extractUnionValues(typesSource, 'FeatureKey');
  const actionKeys = extractUnionValues(typesSource, 'FeatureAction');
  const statusKeys = extractUnionValues(typesSource, 'FeatureStatus');
  const actionFeatureMap = new Map();

  for (const match of matrixSource.matchAll(
    /\{[\s\S]*?action:\s*'([^']+)'[\s\S]*?feature:\s*'([^']+)'[\s\S]*?kind:\s*'[^']+'[\s\S]*?\}/gu,
  )) {
    actionFeatureMap.set(match[1], match[2]);
  }

  const allowedStatusesByFeature = new Map();
  const featureBlocks = matrixSource
    .split(/\n  \{\n/u)
    .filter((block) => block.includes("feature: '") && block.includes('allowedStatuses:'));

  for (const block of featureBlocks) {
    const feature = block.match(/feature: '([^']+)'/u)?.[1];
    const allowedConstant = block.match(/allowedStatuses: ([a-zA-Z]+Statuses)/u)?.[1];
    if (!feature || !allowedConstant) continue;

    if (allowedConstant === 'coreShellStatuses') {
      allowedStatusesByFeature.set(feature, new Set(['enabled']));
    } else if (allowedConstant === 'reportingStatuses') {
      allowedStatusesByFeature.set(
        feature,
        new Set(['enabled', 'hidden', 'maintenance', 'disabled']),
      );
    } else {
      allowedStatusesByFeature.set(feature, new Set(statusKeys));
    }
  }

  return {
    featureKeys,
    actionKeys,
    statusKeys,
    actionFeatureMap,
    allowedStatusesByFeature,
  };
}

function readJsonConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    fail(`Config file not found: ${configPath}`);
  }

  try {
    return JSON.parse(readText(configPath));
  } catch (error) {
    fail(`Invalid JSON in ${configPath}: ${error.message}`);
  }
}

function validateStatus(status, fieldName, matrix) {
  if (typeof status !== 'string' || !matrix.statusKeys.has(status)) {
    fail(`${fieldName} must be one of: ${[...matrix.statusKeys].join(', ')}`);
  }
}

function normalizeControl(rawControl, index, rootConfig, matrix) {
  if (!rawControl || typeof rawControl !== 'object' || Array.isArray(rawControl)) {
    fail(`controls[${index}] must be an object`);
  }

  const feature = rawControl.feature;
  const environment = rawControl.environment ?? rootConfig.environment ?? 'production';
  const platform = rawControl.platform ?? rootConfig.platform ?? 'all';
  const status = rawControl.status;
  const actions = rawControl.actions ?? {};

  if (typeof environment !== 'string' || environment.length === 0) {
    fail(`controls[${index}].environment must be a non-empty string`);
  }

  if (!validPlatforms.has(platform)) {
    fail(`controls[${index}].platform must be one of: ${[...validPlatforms].join(', ')}`);
  }

  if (typeof feature !== 'string' || !matrix.featureKeys.has(feature)) {
    fail(`controls[${index}].feature must be one of: ${[...matrix.featureKeys].join(', ')}`);
  }

  validateStatus(status, `controls[${index}].status`, matrix);

  const allowedStatuses = matrix.allowedStatusesByFeature.get(feature);
  if (allowedStatuses && !allowedStatuses.has(status)) {
    fail(
      `controls[${index}].status "${status}" is not allowed for "${feature}". Allowed: ${[
        ...allowedStatuses,
      ].join(', ')}`,
    );
  }

  if (!actions || typeof actions !== 'object' || Array.isArray(actions)) {
    fail(`controls[${index}].actions must be an object when provided`);
  }

  for (const [action, actionStatus] of Object.entries(actions)) {
    if (!matrix.actionKeys.has(action)) {
      fail(`controls[${index}].actions contains unknown action "${action}"`);
    }

    const owningFeature = matrix.actionFeatureMap.get(action);
    if (owningFeature && owningFeature !== feature) {
      fail(`controls[${index}].actions.${action} belongs to "${owningFeature}", not "${feature}"`);
    }

    validateStatus(actionStatus, `controls[${index}].actions.${action}`, matrix);
  }

  return {
    environment,
    platform,
    feature_key: feature,
    status,
    message: typeof rawControl.message === 'string' ? rawControl.message : null,
    action_overrides: actions,
    updated_at: new Date().toISOString(),
  };
}

function buildRows(config, matrix) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    fail('Root JSON value must be an object');
  }

  if (!Array.isArray(config.controls)) {
    fail('Root JSON must contain a controls array');
  }

  const seen = new Set();
  return config.controls.map((control, index) => {
    const row = normalizeControl(control, index, config, matrix);
    const rowKey = `${row.environment}:${row.platform}:${row.feature_key}`;
    if (seen.has(rowKey)) {
      fail(`Duplicate control for ${rowKey}`);
    }
    seen.add(rowKey);
    return row;
  });
}

function resolveSupabaseEnv() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    fail('Set SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL');
  }

  if (!serviceKey) {
    fail('Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY');
  }

  return {supabaseUrl, serviceKey};
}

async function applyRows(rows) {
  const {supabaseUrl, serviceKey} = resolveSupabaseEnv();
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {error} = await supabase
    .from('feature_controls')
    .upsert(rows, {onConflict: 'environment,platform,feature_key'});

  if (error) {
    fail(error.message);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const matrix = loadRuntimeMatrix();
  const config = readJsonConfig(args.filePath);
  const rows = buildRows(config, matrix);

  print(`Feature controls config: ${path.relative(repoRoot, args.filePath)}`);
  print(`Validated controls: ${rows.length}`);

  for (const row of rows) {
    const actionCount = Object.keys(row.action_overrides).length;
    print(
      `- ${row.environment}/${row.platform}/${row.feature_key}: ${row.status} (${actionCount} actions)`,
    );
  }

  if (args.dryRun) {
    print('Dry run only. No Supabase rows were changed.');
    return;
  }

  await applyRows(rows);
  print('Supabase feature_controls rows upserted successfully.');
}

main().catch((error) => fail(error.message));
