#!/usr/bin/env node
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const dataIntegrity = require('./dataIntegrity');
const relations = require('./relations');
const apiSmoke = require('./apiSmoke');
const performance = require('./performance');
const report = require('./report');

const SQLITE_PATH = process.env.SOURCE_DB || path.join(__dirname, '..', '..', 'dev.db');
const PG_URL = process.env.DATABASE_URL;

async function main() {
    const runApi = process.argv.includes('--api') || process.argv.includes('--all');
    const runPerf = process.argv.includes('--perf') || process.argv.includes('--all');
    const runData = process.argv.includes('--data') || process.argv.includes('--all') || process.argv.length <= 2;
    const recordBaseline = process.argv.includes('--record-baseline');

    const results = [];

    // Check Redis
    try {
        const redis = require('../../utils/redis');
        const connected = await redis.connect();
        results.push({
            name: 'Redis Connectivity',
            status: connected ? 'PASS' : 'WARN',
            details: connected ? 'Redis is connected' : 'Redis unavailable — using in-memory fallback',
            score: connected ? 100 : 50,
        });
    } catch {
        results.push({
            name: 'Redis Connectivity',
            status: 'WARN',
            details: 'Redis module not available — using in-memory fallback',
            score: 50,
        });
    }

    // Connect to SQLite
    const sqliteDb = await open({ filename: SQLITE_PATH, driver: sqlite3.Database });

    // Connect to PostgreSQL
    if (!PG_URL) {
        console.error('DATABASE_URL environment variable required');
        process.exit(1);
    }
    const pool = new Pool({ connectionString: PG_URL });
    const adapter = new PrismaPg(pool);
    const pgPrisma = new PrismaClient({ adapter });

    try {
        if (runData) {
            const integrity = await dataIntegrity.check({ pgPrisma, sqliteDb });
            results.push(integrity);

            const relationChecks = await relations.check({ pgPrisma, sqliteDb });
            results.push(relationChecks);
        }

        if (runApi) {
            const smoke = await apiSmoke.check({ pgPrisma, sqliteDb });
            results.push(smoke);
        }

        if (runPerf) {
            const perfOpts = { pgPrisma, sqliteDb };
            if (recordBaseline) perfOpts.recordBaseline = true;
            const perf = await performance.check(perfOpts);
            results.push(perf);
        }
    } finally {
        await sqliteDb.close();
        await pgPrisma.$disconnect();
        await pool.end();
    }

    const { finalScore, decision, totalErrors } = report.formatResults(results);

    if (process.argv.includes('--exit-code')) {
        if (decision === 'BLOCK' || totalErrors > 0) {
            process.exit(1);
        } else if (decision === 'ALLOW WITH WARNING') {
            process.exit(2);
        } else {
            process.exit(0);
        }
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
