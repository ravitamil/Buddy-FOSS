#!/usr/bin/env node

/**
 * Windows-portable quality gate runner.
 *
 * Usage:
 *   node scripts/quality-check.js type
 *   node scripts/quality-check.js integration
 *   node scripts/quality-check.js lint-errors
 *   node scripts/quality-check.js final
 */

const {spawnSync} = require('child_process');

const isWindows = process.platform === 'win32';

const gates = {
  type: {
    label: 'TypeScript type check',
    command: ['run', 'type-check'],
  },
  integration: {
    label: 'Integration tests',
    command: ['run', 'test:integration', '--', '--watchAll=false', '--passWithNoTests'],
  },
  'lint-errors': {
    label: 'ESLint errors only',
    command: ['run', 'lint', '--', '--quiet'],
  },
};

const gateGroups = {
  final: ['type', 'integration', 'lint-errors'],
};

function print(message = '') {
  process.stdout.write(`${message}\n`);
}

function formatCommand(args) {
  return ['npm', ...args].join(' ');
}

function quoteWindowsArg(arg) {
  if (!/[\s"]/u.test(arg)) {
    return arg;
  }

  return `"${arg.replace(/"/gu, '\\"')}"`;
}

function runNpmCommand(args) {
  if (!isWindows) {
    return spawnSync('npm', args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
      stdio: 'inherit',
    });
  }

  const commandLine = ['npm', ...args].map(quoteWindowsArg).join(' ');

  return spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', commandLine], {
    cwd: process.cwd(),
    env: process.env,
    shell: false,
    stdio: 'inherit',
    windowsHide: true,
  });
}

function runGate(name) {
  const gate = gates[name];

  if (!gate) {
    throw new Error(`Unknown quality gate: ${name}`);
  }

  print('');
  print(`[RUN] ${gate.label}`);
  print(`      ${formatCommand(gate.command)}`);

  const startedAt = Date.now();
  const result = runNpmCommand(gate.command);
  const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);

  if (result.error) {
    print(`[FAIL] ${gate.label} could not start: ${result.error.message}`);
    return {
      name,
      label: gate.label,
      success: false,
      elapsedSeconds,
    };
  }

  const success = result.status === 0;
  print(`[${success ? 'PASS' : 'FAIL'}] ${gate.label} (${elapsedSeconds}s)`);

  return {
    name,
    label: gate.label,
    success,
    elapsedSeconds,
  };
}

function resolveRequestedGates(argument) {
  const requested = argument || 'final';

  if (gateGroups[requested]) {
    return gateGroups[requested];
  }

  if (gates[requested]) {
    return [requested];
  }

  const validNames = [...Object.keys(gates), ...Object.keys(gateGroups)].join(', ');
  throw new Error(`Unknown quality gate "${requested}". Valid gates: ${validNames}`);
}

function printSummary(results) {
  const passed = results.filter(result => result.success).length;

  print('');
  print('Quality gate summary');
  print('--------------------');

  for (const result of results) {
    const status = result.success ? 'PASS' : 'FAIL';
    print(`${status.padEnd(4)} ${result.label} (${result.elapsedSeconds}s)`);
  }

  print('');
  print(`Result: ${passed}/${results.length} passed`);
}

function main() {
  const requestedGates = resolveRequestedGates(process.argv[2]);

  print('BuddyIO quality checks');
  print('======================');
  print(`Selected gates: ${requestedGates.join(', ')}`);

  const results = requestedGates.map(runGate);
  printSummary(results);

  const failed = results.some(result => !result.success);
  process.exit(failed ? 1 : 0);
}

try {
  main();
} catch (error) {
  process.stderr.write(`Quality check failed: ${error.message}\n`);
  process.exit(1);
}
