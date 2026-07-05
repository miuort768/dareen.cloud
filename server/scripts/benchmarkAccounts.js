const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { prisma } = require('../utils/prisma');
const logger = require('../utils/logger');
const { performance } = require('perf_hooks');

const ITERATIONS = 50;
const WARMUP = 5;
const USERS = ['admin_bench', 'teacher_bench', 'parent_bench', 'student_bench', 'chat_bench'];
const PASS = 'BenchPass123!';

function record(results, label, durationMs) {
  results.push({ label, durationMs });
  logger.info(`  ${label}: ${durationMs.toFixed(2)}ms`);
}

function percentile(sorted, pct) {
  const idx = Math.ceil((pct / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function benchmark() {
  logger.info('=== Account Benchmark Started ===');

  const results = [];

  // ── 1. Login P95/P99 via authAccounts ──
  const { authenticate } = require('../services/authAccounts');

  for (const mode of ['legacy', 'dual', 'accounts']) {
    process.env.AUTH_MODE = mode;
    // Clear require cache to reload authAccounts module
    delete require.cache[require.resolve('../services/authAccounts')];
    const { authenticate: authFn } = require('../services/authAccounts');

    const timings = [];
    for (let i = 0; i < WARMUP + ITERATIONS; i++) {
      const username = USERS[0];
      const start = performance.now();
      await authFn(username.trim().toLowerCase(), PASS);
      const elapsed = performance.now() - start;
      if (i >= WARMUP) timings.push(elapsed);
    }
    timings.sort((a, b) => a - b);
    const avg = timings.reduce((s, v) => s + v, 0) / timings.length;
    const p95 = percentile(timings, 95);
    const p99 = percentile(timings, 99);
    logger.info(`  [${mode}] Login: avg=${avg.toFixed(2)}ms p95=${p95.toFixed(2)}ms p99=${p99.toFixed(2)}ms`);
    results.push({ mode, metric: 'login_p95', value: p95 });
    results.push({ mode, metric: 'login_p99', value: p99 });
    results.push({ mode, metric: 'login_avg', value: avg });
  }

  // ── 2. Auth DB Queries per login ──
  // Legacy: 5 parallel queries, Dual: 1 (account) + fallback if needed, Accounts: 1
  logger.info(`  Legacy: 5 queries (parallel), Dual: 1 query (+ fallback), Accounts: 1 query`);

  // ── 3. Audit write time ──
  const { logWithRequest } = require('../services/auditService');
  const auditTimings = [];
  for (let i = 0; i < WARMUP + ITERATIONS; i++) {
    const req = { requestId: `bench-${i}`, ip: '127.0.0.1', headers: { 'user-agent': 'benchmark' } };
    const start = performance.now();
    await logWithRequest(req, { action: 'LOGIN_SUCCESS', status: 'SUCCESS' });
    const elapsed = performance.now() - start;
    if (i >= WARMUP) auditTimings.push(elapsed);
  }
  auditTimings.sort((a, b) => a - b);
  const auditAvg = auditTimings.reduce((s, v) => s + v, 0) / auditTimings.length;
  logger.info(`  Audit Write: avg=${auditAvg.toFixed(2)}ms`);
  results.push({ mode: 'all', metric: 'audit_write_avg', value: auditAvg });

  // ── 4. Summary ──
  logger.info('=== Benchmark Complete ===');
  logger.info('');
  logger.info('Metric                    | Legacy | Dual  | Accounts');
  logger.info('--------------------------|--------|-------|---------');
  for (const m of ['login_p95', 'login_p99', 'login_avg']) {
    const vals = results.filter(r => r.metric === m);
    const legacy = vals.find(v => v.mode === 'legacy')?.value.toFixed(2) || '-';
    const dual = vals.find(v => v.mode === 'dual')?.value.toFixed(2) || '-';
    const accounts = vals.find(v => v.mode === 'accounts')?.value.toFixed(2) || '-';
    logger.info(`${m.padEnd(25)} | ${legacy}ms | ${dual}ms | ${accounts}ms`);
  }
  logger.info(`${'audit_write_avg'.padEnd(25)} | ${auditAvg.toFixed(2)}ms (all modes)`);
  logger.info(`${'Auth DB Queries'.padEnd(25)} | 5       | 1      | 1`);

  return results;
}

if (require.main === module) {
  benchmark()
    .then(() => process.exit(0))
    .catch((err) => { logger.error('Benchmark failed', err); process.exit(1); });
}

module.exports = { benchmark };
