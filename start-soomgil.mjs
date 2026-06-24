#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const env = { ...parseEnvFile(join(rootDir, '.env')), ...process.env };
const frontendUrl = `http://localhost:${env.FRONTEND_PORT || '5173'}`;
const backendUrl = `http://localhost:${env.SERVER_PORT || '8080'}`;

await main();

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }

  const compose = resolveComposeCommand();
  const mode = normalizeMode(process.argv[2]) || await chooseMode();

  if (mode === 'stop') {
    step('Stopping Soomgil containers');
    run(compose[0], [...compose.slice(1), '--profile', 'full', 'down']);
    console.log('Soomgil containers stopped. Docker volumes were preserved.');
    return;
  }

  if (mode === 'reset') {
    run(process.execPath, [join(rootDir, 'init-demo-dump.mjs')]);
    console.log(`Backend: ${backendUrl}`);
    return;
  }

  const services = mode === 'both' ? ['backend', 'frontend'] : [mode];
  const args = [...compose.slice(1), '--profile', 'full', 'up', '--build', '-d'];
  if (mode === 'frontend') {
    args.push('--no-deps');
  }
  args.push(...services);

  step(`Starting ${mode === 'both' ? 'frontend and backend' : mode}`);
  run(compose[0], args);

  if (mode === 'backend' || mode === 'both') {
    await waitForUrl(`${backendUrl}/api/v1/health`, 'Backend');
    console.log(`Backend: ${backendUrl}`);
  }
  if (mode === 'frontend' || mode === 'both') {
    await waitForUrl(frontendUrl, 'Frontend');
    console.log(`Frontend: ${frontendUrl}`);
  }

  if (mode === 'frontend') {
    console.log('Frontend-only mode does not start the API server. Existing API calls may fail until backend is started.');
  }
}

async function chooseMode() {
  if (!process.stdin.isTTY) {
    fail('Choose a mode: both, backend, frontend, reset, or stop.');
  }

  console.log(`
Soomgil launcher
  1. Frontend + Backend
  2. Backend only
  3. Frontend only
  4. Reset demo database
  5. Stop all containers
`);
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await readline.question('Select [1-5]: ');
  readline.close();
  const mode = normalizeMode(answer);
  if (!mode) {
    fail('Invalid selection.');
  }
  return mode;
}

function normalizeMode(value = '') {
  const modes = new Map([
    ['1', 'both'], ['both', 'both'], ['all', 'both'],
    ['2', 'backend'], ['backend', 'backend'], ['be', 'backend'],
    ['3', 'frontend'], ['frontend', 'frontend'], ['fe', 'frontend'],
    ['4', 'reset'], ['reset', 'reset'], ['dump', 'reset'],
    ['5', 'stop'], ['stop', 'stop'], ['down', 'stop'],
  ]);
  return modes.get(String(value).trim().toLowerCase()) || null;
}

function resolveComposeCommand() {
  if (run('docker', ['compose', 'version'], { allowFailure: true, quiet: true }).status === 0) {
    return ['docker', 'compose'];
  }
  if (run('docker-compose', ['version'], { allowFailure: true, quiet: true }).status === 0) {
    return ['docker-compose'];
  }
  fail('Docker Compose was not found. Start Docker Desktop and try again.');
}

async function waitForUrl(url, label) {
  const timeoutAt = Date.now() + 180_000;
  while (Date.now() < timeoutAt) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // The service is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  fail(`${label} did not become ready within 180 seconds. Check Docker logs.`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env,
    encoding: 'utf8',
    stdio: options.quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: false,
  });

  if (result.error?.code === 'ENOENT') {
    if (options.allowFailure) return { status: 127 };
    fail(`Command not found: ${command}`);
  }
  const status = result.status ?? 1;
  if (status !== 0 && !options.allowFailure) {
    fail(`Command failed: ${command} ${args.join(' ')}`);
  }
  return { status };
}

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
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

function printHelp() {
  console.log(`Usage:
  node start-soomgil.mjs [both|backend|frontend|reset|stop]

Without a mode, an interactive menu is displayed.
The reset mode permanently deletes DB_NAME and loads the demo dump again.`);
}

function step(message) {
  console.log(`\n==> ${message}`);
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
