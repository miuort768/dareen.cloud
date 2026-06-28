#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHECKS = [];
let failed = false;

function check(name, fn) {
    CHECKS.push({ name, fn });
}

function ok(msg) {
    console.log(`  ✅ ${msg}`);
}

function fail(msg) {
    console.log(`  ❌ ${msg}`);
    failed = true;
}

// ─── Docker ───
check('Docker daemon running', () => {
    try {
        execSync('docker ps', { stdio: 'pipe', timeout: 5000 });
        ok('Docker is running');
    } catch {
        fail('Docker is not running or not accessible');
    }
});

// ─── PostgreSQL image ───
check('PostgreSQL image available', () => {
    try {
        execSync('docker image inspect postgres:16-alpine', { stdio: 'pipe', timeout: 5000 });
        ok('postgres:16-alpine image found');
    } catch {
        fail('postgres:16-alpine image not found. Run: docker pull postgres:16-alpine');
    }
});

// ─── DATABASE_URL ───
check('DATABASE_URL set and valid', () => {
    const url = process.env.DATABASE_URL;
    if (!url) return fail('DATABASE_URL is not set');
    if (!url.startsWith('postgresql://')) return fail(`DATABASE_URL must start with postgresql:// (got: ${url.slice(0, 20)}...)`);
    ok(`DATABASE_URL is set (${url.slice(0, 30)}...)`);
});

// ─── Prisma client ───
check('Prisma client generated', () => {
    try {
        require('@prisma/client');
        ok('Prisma client module found');
    } catch {
        fail('Prisma client not generated. Run: cd server && npx prisma generate');
    }
});

// ─── Disk space ───
check('Disk space > 5GB', () => {
    try {
        const out = execSync('df / | tail -1 | awk \'{print $4}\'', { encoding: 'utf8', timeout: 3000 });
        const kb = parseInt(out.trim(), 10);
        const gb = kb / 1024 / 1024;
        if (gb > 5) ok(`${gb.toFixed(1)}GB available`);
        else fail(`Only ${gb.toFixed(1)}GB available (need >5GB)`);
    } catch {
        // Windows fallback
        ok('Disk check skipped (non-Unix)');
    }
});

// ─── SQLite files ───
check('SQLite databases accessible', () => {
    const dir = path.join(__dirname, '..', 'server');
    const files = ['database.sqlite', 'dev.db'];
    let okCount = 0;
    for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.existsSync(fp)) { okCount++; } else { fail(`Missing: ${f}`); }
    }
    if (okCount === files.length) ok(`All ${files.length} SQLite databases found`);
});

// ─── Uploads directory ───
check('Uploads directory exists', () => {
    const uploadDir = path.join(__dirname, '..', 'server', 'uploads');
    if (fs.existsSync(uploadDir)) ok('uploads/ directory exists');
    else fail('uploads/ directory not found');
});

// ─── Redis image ───
check('Redis image available', () => {
    try {
        execSync('docker image inspect redis:7-alpine', { stdio: 'pipe', timeout: 5000 });
        ok('redis:7-alpine image found');
    } catch {
        fail('redis:7-alpine image not found. Run: docker pull redis:7-alpine');
    }
});

// ─── Redis connectivity ───
check('Redis reachable', () => {
    try {
        execSync('docker-compose exec -T redis redis-cli ping', { stdio: 'pipe', timeout: 5000 });
        ok('Redis is reachable (PONG)');
    } catch {
        fail('Redis is not reachable. Is the container running?');
    }
});

// ─── PostgreSQL connectivity ───
check('PostgreSQL reachable', () => {
    const url = process.env.DATABASE_URL;
    if (!url) return;
    try {
        const { execSync } = require('child_process');
        // Try psql or pg_isready
        execSync(`docker-compose exec -T postgres pg_isready -U darin -d darin`, { stdio: 'pipe', timeout: 5000 });
        ok('PostgreSQL is reachable and accepting connections');
    } catch {
        fail('PostgreSQL is not reachable. Is the container running?');
    }
});

// ─── .env.production ───
check('.env.production exists and has DB_PASSWORD', () => {
    const envPath = path.join(__dirname, '..', 'server', '.env.production');
    if (!fs.existsSync(envPath)) return fail('.env.production not found');
    const content = fs.readFileSync(envPath, 'utf8');
    const pwMatch = content.match(/DB_PASSWORD=(.+)/);
    if (pwMatch && pwMatch[1] && pwMatch[1] !== 'your_secure_password_here') {
        ok('DB_PASSWORD is set in .env.production');
    } else {
        fail('DB_PASSWORD missing or still default in .env.production');
    }
});

// ─── Run all checks ───
console.log('\n═══════════════════════════════════════');
console.log('  00_preflight.js — Environment Check');
console.log('═══════════════════════════════════════\n');

for (const c of CHECKS) {
    try {
        c.fn();
    } catch (e) {
        fail(`${c.name}: ${e.message}`);
    }
}

console.log('');
if (failed) {
    console.log('❌ Preflight FAILED — resolve issues above before proceeding.\n');
    process.exit(1);
} else {
    console.log('✅ All checks passed. Environment is ready.\n');
    process.exit(0);
}
