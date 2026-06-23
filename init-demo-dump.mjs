#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const rootDir = dirname(fileURLToPath(import.meta.url));
const tempRoot = '/tmp/soomgil-demo-init';
const dbService = process.env.DB_SERVICE || 'postgres';
const maxWaitSeconds = Number(process.env.SEED_WAIT_SECONDS || 180);

const files = {
  demoSeed: join(rootDir, 'backend', 'seeds', 'soomgil_demo_seoul_daejeon.sql'),
  realisticPatch: join(rootDir, 'backend', 'seeds', 'soomgil_demo_realistic_patch.sql'),
  verifier: join(rootDir, 'backend', 'seeds', 'verify_demo_data.sql'),
  devSeeds: join(rootDir, 'backend', 'dev-seeds'),
};

const env = {
  ...parseEnvFile(join(rootDir, '.env')),
  ...process.env,
};

const dbUser = env.DB_USERNAME || 'soomgil';
const dbName = env.DB_NAME || 'soomgil';

main();

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }

  for (const [label, path] of Object.entries(files)) {
    if (!existsSync(path)) {
      fail(`Required ${label} path was not found: ${path}`);
    }
  }

  const compose = resolveComposeCommand();
  const containerId = getPostgresContainerId(compose);

  step('Waiting for PostgreSQL to accept connections');
  waitUntil(
    () => run('docker', ['exec', containerId, 'pg_isready', '-U', dbUser, '-d', dbName], { allowFailure: true, quiet: true }).status === 0,
    `PostgreSQL did not become ready within ${maxWaitSeconds} seconds.`,
  );

  step('Waiting for backend Flyway migrations');
  waitUntil(
    () => queryScalar(containerId, "SELECT (to_regclass('auth.users') IS NOT NULL AND to_regclass('community.posts') IS NOT NULL AND to_regclass('tourism_source.attractions') IS NOT NULL)::int;") === '1',
    `Required schema tables were not found within ${maxWaitSeconds} seconds. Check that the backend service finished starting.`,
  );

  stageSqlFiles(containerId);

  runPsqlFile(containerId, `${tempRoot}/seeds/soomgil_demo_seoul_daejeon.sql`, 'Applying large Seoul/Daejeon demo data');
  runPsqlFile(containerId, `${tempRoot}/seeds/soomgil_demo_realistic_patch.sql`, 'Applying realistic demo patch');
  runPsqlFile(containerId, `${tempRoot}/seeds/verify_demo_data.sql`, 'Verifying demo data invariants');
  runPsqlFile(containerId, '00_run_all.sql', 'Applying domain development seeds', `${tempRoot}/dev-seeds`);

  console.log('');
  console.log('Done. Demo dump and development seeds were initialized.');
}

function printHelp() {
  console.log(`Usage:
  node init-demo-dump.mjs

Prerequisite:
  docker-compose --profile full up --build -d

Environment overrides:
  DB_SERVICE=postgres
  DB_USERNAME=soomgil
  DB_NAME=soomgil
  SEED_WAIT_SECONDS=180

Runs in order:
  1. backend/seeds/soomgil_demo_seoul_daejeon.sql
  2. backend/seeds/soomgil_demo_realistic_patch.sql
  3. backend/seeds/verify_demo_data.sql
  4. backend/dev-seeds/00_run_all.sql`);
}

function resolveComposeCommand() {
  if (run('docker', ['compose', 'version'], { allowFailure: true, quiet: true }).status === 0) {
    return ['docker', 'compose'];
  }
  if (run('docker-compose', ['version'], { allowFailure: true, quiet: true }).status === 0) {
    return ['docker-compose'];
  }
  fail('Docker Compose was not found. Install Docker Compose v2 or docker-compose v1.');
}

function getPostgresContainerId(compose) {
  const result = run(compose[0], [...compose.slice(1), 'ps', '-q', dbService], { capture: true, allowFailure: true });
  const containerId = result.stdout.trim();
  if (result.status !== 0 || !containerId) {
    fail(`PostgreSQL service "${dbService}" is not running. Start the stack first: docker compose --profile full up --build -d`);
  }
  return containerId;
}

function stageSqlFiles(containerId) {
  step('Staging SQL files inside the PostgreSQL container');
  run('docker', ['exec', containerId, 'sh', '-c', `rm -rf ${tempRoot} && mkdir -p ${tempRoot}/seeds ${tempRoot}/dev-seeds`]);

  dockerCp(files.demoSeed, `${containerId}:${tempRoot}/seeds/soomgil_demo_seoul_daejeon.sql`);
  dockerCp(files.realisticPatch, `${containerId}:${tempRoot}/seeds/soomgil_demo_realistic_patch.sql`);
  dockerCp(files.verifier, `${containerId}:${tempRoot}/seeds/verify_demo_data.sql`);
  dockerCp(resolve(files.devSeeds) + '/.', `${containerId}:${tempRoot}/dev-seeds`);
}

function dockerCp(source, destination) {
  run('docker', ['cp', source, destination]);
}

function runPsqlFile(containerId, filePath, label, workdir = undefined) {
  step(label);
  const args = ['exec'];
  if (workdir) {
    args.push('-w', workdir);
  }
  args.push(containerId, 'psql', '-U', dbUser, '-d', dbName, '-v', 'ON_ERROR_STOP=1', '-f', filePath);
  run('docker', args);
}

function queryScalar(containerId, sql) {
  const result = run(
    'docker',
    ['exec', containerId, 'psql', '-U', dbUser, '-d', dbName, '-tAc', sql],
    { capture: true, allowFailure: true, quiet: true },
  );
  if (result.status !== 0) {
    return '';
  }
  return result.stdout.trim();
}

function waitUntil(predicate, errorMessage) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < maxWaitSeconds * 1000) {
    if (predicate()) {
      return;
    }
    sleep(1000);
  }
  fail(errorMessage);
}

function sleep(milliseconds) {
  const until = Date.now() + milliseconds;
  while (Date.now() < until) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(100, until - Date.now()));
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env,
    encoding: 'utf8',
    stdio: options.capture || options.quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: false,
  });

  if (result.error && result.error.code === 'ENOENT') {
    if (options.allowFailure) {
      return { status: 127, stdout: '', stderr: result.error.message };
    }
    fail(`Command not found: ${command}`);
  }

  const status = result.status ?? 1;
  if (status !== 0 && !options.allowFailure) {
    if (options.capture || options.quiet) {
      process.stderr.write(result.stderr || result.stdout || '');
    }
    fail(`Command failed: ${command} ${args.join(' ')}`);
  }

  return {
    status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  const values = {};
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }
    values[match[1]] = stripEnvValue(match[2]);
  }
  return values;
}

function stripEnvValue(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function step(message) {
  console.log(`\n==> ${message}`);
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
