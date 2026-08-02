const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync, execFileSync } = require('child_process');
const { Client } = require('pg');
const { DATABASE_DIR, PG_PORT, PG_HOST, PG_USER, PG_PASSWORD, PG_DB, TEST_URL } = require('./testDbConfig');

const SERVER_DIR = path.join(__dirname, '..', '..');

// The embedded-postgres binaries live under a project path that contains
// Arabic characters. On Windows the backend converts those path bytes via the
// ANSI codepage (CP1256), which is invalid inside a UTF-8 cluster: initdb dies
// with `invalid byte sequence for encoding "UTF8": 0xcf 0xc7`. Copying the
// binaries to a pure-ASCII temp dir fixes this deterministically.
const NATIVE_SRC = path.join(path.dirname(require.resolve('@embedded-postgres/windows-x64')), 'native');
const PG_ROOT = path.join(os.tmpdir(), 'dareen-pg-native');
const PG_BIN = path.join(PG_ROOT, 'bin');
const PG_LOG = path.join(os.tmpdir(), 'dareen-pg.log');

let serverProc = null;

function ensureBinaries() {
    if (!fs.existsSync(path.join(PG_BIN, 'initdb.exe'))) {
        fs.rmSync(PG_ROOT, { recursive: true, force: true });
        fs.cpSync(NATIVE_SRC, PG_ROOT, { recursive: true });
    }
}

function waitForReady(proc) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('postgres did not become ready in 120s')), 120000);
        const drain = (chunk) => {
            const msg = chunk.toString();
            try { fs.appendFileSync(PG_LOG, msg); } catch { /* ignore */ }
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
    const client = new Client({ host: PG_HOST, port: PG_PORT, user: PG_USER, password: PG_PASSWORD, database: 'postgres' });
    await client.connect();
    await client.query(`CREATE DATABASE ${PG_DB}`);
    await client.end();
}

export default async function globalSetup() {
    ensureBinaries();

    // Stop any leftover postmaster from a previous crashed/killed run.
    try {
        execFileSync('taskkill', ['/im', 'postgres.exe', '/f', '/t'], { stdio: 'ignore' });
    } catch {
        // none running
    }
    fs.rmSync(DATABASE_DIR, { recursive: true, force: true });

    execFileSync(path.join(PG_BIN, 'initdb.exe'), [
        `--pgdata=${DATABASE_DIR}`,
        `--username=${PG_USER}`,
        '--auth=trust',
        '--encoding=UTF8',
        '--lc-collate=C',
        '--lc-ctype=C',
        '--lc-monetary=C',
        '--lc-numeric=C',
        '--lc-time=C',
    ], { cwd: PG_ROOT, stdio: 'pipe' });

    // Spawn postgres as a direct child of this process (like embedded-postgres
    // does) so teardown can kill the whole tree. autovacuum is disabled because
    // its worker spawn intermittently crashes on this machine (0xC0000142).
    serverProc = spawn(path.join(PG_BIN, 'postgres.exe'), [
        '-D', DATABASE_DIR,
        '-p', String(PG_PORT),
        '-c', 'autovacuum=off',
        '-c', 'max_connections=50',
        '-c', 'shared_buffers=64MB',
    ], { cwd: PG_ROOT, stdio: ['ignore', 'pipe', 'pipe'] });

    await waitForReady(serverProc);

    await createDatabase();

    execSync('npx prisma migrate deploy', {
        cwd: SERVER_DIR,
        env: { ...process.env, DATABASE_URL: TEST_URL },
        stdio: 'inherit',
    });

    return async function globalTeardown() {
        if (serverProc && serverProc.pid) {
            try {
                execFileSync('taskkill', ['/pid', String(serverProc.pid), '/f', '/t'], { stdio: 'ignore' });
            } catch (err) {
                console.error('[pg teardown]', err.message);
            }
        }
    };
}
