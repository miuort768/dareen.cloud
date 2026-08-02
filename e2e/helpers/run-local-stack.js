/**
 * Boots the full local stack for the Playwright Dynamic UI Audit:
 *   embedded-postgres (ASCII temp dir) -> migrate -> seed -> API server (3001) -> Vite (5173)
 *
 * Usage:  node e2e/helpers/run-local-stack.js
 * Then:   npx playwright test e2e/dynamic-audit.spec.ts --project=chromium --reporter=line
 * Teardown happens automatically on Ctrl+C / process exit (kills the whole tree + PG data).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const SERVER_DIR = path.join(ROOT, 'server');

const PG_PORT = 55444;
const PG_HOST = '127.0.0.1';
const PG_USER = 'postgres';
const PG_PASSWORD = 'postgres';
const PG_DB = 'darin';
const DATABASE_URL = `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}`;

const requireFromServer = (name) => require.resolve(name, { paths: [SERVER_DIR] });
const PG_BINARY_PKG = path.dirname(path.dirname(requireFromServer('@embedded-postgres/windows-x64')));
const NATIVE_SRC = path.join(PG_BINARY_PKG, 'native');
const PG = requireFromServer('pg');
const PRISMA_CLI = requireFromServer('prisma/build/index.js');
const PG_ROOT = path.join(os.tmpdir(), 'dareen-e2e-pg-native');
const PG_BIN = path.join(PG_ROOT, 'bin');
const PG_DATA = path.join(os.tmpdir(), 'dareen-e2e-pg-data');
const PG_LOG = path.join(os.tmpdir(), 'dareen-e2e-pg.log');
const SERVER_LOG = path.join(os.tmpdir(), 'dareen-e2e-server.log');
const VITE_LOG = path.join(os.tmpdir(), 'dareen-e2e-vite.log');

const children = [];

function ensureBinaries() {
  if (!fs.existsSync(path.join(PG_BIN, 'initdb.exe'))) {
    fs.rmSync(PG_ROOT, { recursive: true, force: true });
    fs.mkdirSync(PG_ROOT, { recursive: true });
    // fs.cpSync of the ~250MB native dir crashes node on this machine
    // (0xC0000409); robocopy is robust against AV interference.
    try {
      execFileSync('robocopy', [NATIVE_SRC, PG_ROOT, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NC', '/NS', '/NP', '/MT:8'], { stdio: 'ignore' });
    } catch (e) {
      if (e.status && e.status >= 8) throw new Error('robocopy failed with code ' + e.status);
    }
  }
}

function waitForPostgres(proc) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('postgres did not become ready in 120s')), 120000);
    const drain = (chunk) => {
      const msg = chunk.toString();
      try { fs.appendFileSync(PG_LOG, msg); } catch {}
      if (msg.includes('database system is ready to accept connections')) {
        clearTimeout(timer);
        resolve();
      }
    };
    proc.stderr.on('data', drain);
    proc.on('close', (code) => {
      clearTimeout(timer);
      reject(new Error(`postgres exited early (code ${code})`));
    });
  });
}

async function createDatabase() {
  const { Client } = require(PG);
  const client = new Client({ host: PG_HOST, port: PG_PORT, user: PG_USER, password: PG_PASSWORD, database: 'postgres' });
  await client.connect();
  const row = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [PG_DB]);
  if (row.rowCount === 0) await client.query(`CREATE DATABASE ${PG_DB}`);
  await client.end();
}

function runCmd(file, args, cwd, extraEnv = {}) {
  execFileSync(file, args, { cwd, env: { ...process.env, ...extraEnv }, stdio: 'inherit' });
}

function isUp(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const req = require('http').get(url, (res) => { res.resume(); res.statusCode < 500 ? resolve(true) : resolve(false); });
    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(false); });
  });
}

function waitUp(url, name, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = async () => {
      if (await isUp(url)) { console.log(`[stack] ${name} is READY`); return resolve(); }
      if (Date.now() - start > timeoutMs) return reject(new Error(`${name} did not come up in ${timeoutMs}ms`));
      setTimeout(tick, 1000);
    };
    tick();
  });
}

function logStream(logFile) {
  return (chunk) => { try { fs.appendFileSync(logFile, chunk); } catch {} };
}

async function main() {
  console.error('[trace] main start');
  fs.rmSync(PG_LOG, { force: true });
  fs.rmSync(SERVER_LOG, { force: true });
  fs.rmSync(VITE_LOG, { force: true });

  console.error('[trace] checking ports');
  const serverAlreadyUp = await isUp('http://localhost:3001/health');
  const viteAlreadyUp = await isUp('http://localhost:5173/');
  console.error('[trace] serverUp=' + serverAlreadyUp + ' viteUp=' + viteAlreadyUp);

  if (!serverAlreadyUp) {
    console.error('[trace] ensureBinaries');
    ensureBinaries();
    console.error('[trace] taskkill');
    try { execFileSync('taskkill', ['/im', 'postgres.exe', '/f', '/t'], { stdio: 'ignore' }); } catch {}
    fs.rmSync(PG_DATA, { recursive: true, force: true });

    console.error('[trace] initdb');
    execFileSync(path.join(PG_BIN, 'initdb.exe'), [
      `--pgdata=${PG_DATA}`,
      `--username=${PG_USER}`,
      '--auth=trust',
      '--encoding=UTF8',
      '--lc-collate=C', '--lc-ctype=C', '--lc-monetary=C', '--lc-numeric=C', '--lc-time=C',
    ], { cwd: PG_ROOT, stdio: 'pipe' });
    console.error('[trace] initdb done, starting postgres');

    const pg = spawn(path.join(PG_BIN, 'postgres.exe'), [
      '-D', PG_DATA, '-p', String(PG_PORT),
      '-c', 'autovacuum=off', '-c', 'max_connections=50', '-c', 'shared_buffers=64MB',
    ], { cwd: PG_ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    children.push({ proc: pg });
    await waitForPostgres(pg);
    await createDatabase();

    console.log('[stack] running prisma migrate deploy ...');
    runCmd(process.execPath, [PRISMA_CLI, 'migrate', 'deploy'], SERVER_DIR, { DATABASE_URL });
    console.log('[stack] seeding (seed.js + seed-demo.js) ...');
    runCmd(process.execPath, ['prisma/seed.js'], SERVER_DIR, { DATABASE_URL });
    runCmd(process.execPath, ['prisma/seed-demo.js'], SERVER_DIR, { DATABASE_URL });

    const server = spawn(process.execPath, ['server/index.js'], {
      cwd: ROOT,
      env: { ...process.env, DATABASE_URL, JWT_SECRET: 'e2e-local-secret-not-default-2026', NODE_ENV: 'development', PORT: '3001' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    children.push({ proc: server });
    server.stdout.on('data', logStream(SERVER_LOG));
    server.stderr.on('data', logStream(SERVER_LOG));
    await waitUp('http://localhost:3001/health', 'API server (3001)');
  } else {
    console.log('[stack] API server already up on 3001 — reusing it');
  }

  if (!viteAlreadyUp) {
    const VITE_PKG = path.dirname(require.resolve('vite/package.json', { paths: [ROOT] }));
    const VITE_CLI = path.join(VITE_PKG, 'bin', 'vite.js');
    const vite = spawn(process.execPath, [VITE_CLI], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    children.push({ proc: vite });
    vite.stdout.on('data', logStream(VITE_LOG));
    vite.stderr.on('data', logStream(VITE_LOG));
    await waitUp('http://localhost:5173/', 'Vite (5173)');
  } else {
    console.log('[stack] Vite already up on 5173 — reusing it');
  }

  console.log('E2E_STACK_READY');
}

function shutdown(code) {
  for (const c of children.reverse()) {
    try { execFileSync('taskkill', ['/pid', String(c.proc.pid), '/f', '/t'], { stdio: 'ignore' }); } catch {}
  }
  try { fs.rmSync(PG_DATA, { recursive: true, force: true }); } catch {}
  process.exit(code || 0);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (e) => { console.error('[stack] uncaught:', e.message); shutdown(1); });
process.on('unhandledRejection', (e) => { console.error('[stack] unhandled:', e && e.message); shutdown(1); });

main().catch((e) => { console.error('[stack] failed:', e.message); shutdown(1); });
