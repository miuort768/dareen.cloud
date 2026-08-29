const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync, execFileSync } = require('child_process');
const { Client } = require('pg');
const { DATABASE_DIR, PG_PORT, PG_HOST, PG_USER, PG_PASSWORD, PG_DB, TEST_URL } = require('./testDbConfig');

const SERVER_DIR = path.join(__dirname, '..', '..');
const IS_WIN = process.platform === 'win32';
const BIN_EXT = IS_WIN ? '.exe' : '';

// Resolve the platform-specific embedded-postgres binary package.
// CI runs on Linux while dev machines are Windows — never hardcode one.
function platformPackage() {
    if (IS_WIN) return '@embedded-postgres/windows-x64';
    if (process.platform === 'darwin') {
        return os.arch() === 'arm64' ? '@embedded-postgres/darwin-arm64' : '@embedded-postgres/darwin-x64';
    }
    return os.arch() === 'arm64' ? '@embedded-postgres/linux-arm64' : '@embedded-postgres/linux-x64';
}

// On Windows the project path contains Arabic characters and the backend
// converts those path bytes via the ANSI codepage (CP1256), which is invalid
// inside a UTF-8 cluster: initdb dies with `invalid byte sequence for encoding
// "UTF8": 0xcf 0xc7`. Copying the binaries to a pure-ASCII temp dir fixes this
// deterministically. (Harmless on Linux.)
// native/ location differs per platform build (windows: dist/native,
// linux: root/native) — walk up from the resolved main entry until found.
function resolveNativeDir() {
    let dir = path.dirname(require.resolve(platformPackage()));
    for (let i = 0; i < 4; i++) {
        const candidate = path.join(dir, 'native');
        if (fs.existsSync(candidate)) return candidate;
        dir = path.dirname(dir);
    }
    throw new Error(`native dir not found for ${platformPackage()}`);
}
const NATIVE_SRC = resolveNativeDir();
const PG_ROOT = path.join(os.tmpdir(), 'dareen-pg-native');
const PG_BIN = path.join(PG_ROOT, 'bin');
const PG_LOG = path.join(os.tmpdir(), 'dareen-pg.log');

let serverProc = null;

function ensureBinaries() {
    if (!fs.existsSync(path.join(PG_BIN, `initdb${BIN_EXT}`))) {
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

function killLeftovers() {
    try {
        if (IS_WIN) {
            execFileSync('taskkill', ['/im', `postgres${BIN_EXT}`, '/f', '/t'], { stdio: 'ignore' });
        } else {
            execFileSync('pkill', ['-9', '-f', `postgres -D ${DATABASE_DIR}`], { stdio: 'ignore' });
        }
    } catch {
        // none running
    }
}

function killTree(proc) {
    try {
        if (IS_WIN) {
            execFileSync('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' });
        } else if (proc.pid) {
            // detached spawn => negative pid kills the whole process group
            process.kill(-proc.pid, 'SIGKILL');
        }
    } catch (err) {
        console.error('[pg teardown]', err.message);
    }
}

export default async function globalSetup() {
    ensureBinaries();

    // Stop any leftover postmaster from a previous crashed/killed run.
    killLeftovers();
    fs.rmSync(DATABASE_DIR, { recursive: true, force: true });

    execFileSync(path.join(PG_BIN, `initdb${BIN_EXT}`), [
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

    // Spawn postgres as a direct child (detached on POSIX so the process group
    // can be killed in teardown) with autovacuum disabled — its worker spawn
    // intermittently crashed on Windows (0xC0000142).
    serverProc = spawn(path.join(PG_BIN, `postgres${BIN_EXT}`), [
        '-D', DATABASE_DIR,
        '-p', String(PG_PORT),
        '-c', 'autovacuum=off',
        '-c', 'max_connections=50',
        '-c', 'shared_buffers=64MB',
    ], { cwd: PG_ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: !IS_WIN });

    await waitForReady(serverProc);

    await createDatabase();

    execSync('npx prisma migrate deploy', {
        cwd: SERVER_DIR,
        env: { ...process.env, DATABASE_URL: TEST_URL },
        stdio: 'inherit',
    });

    return async function globalTeardown() {
        if (serverProc && serverProc.pid) {
            killTree(serverProc);
        }
    };
}
