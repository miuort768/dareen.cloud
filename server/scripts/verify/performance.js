const fs = require('fs');
const path = require('path');
const http = require('http');

const BASELINE_PATH = process.env.PERF_BASELINE_PATH || path.join(__dirname, '..', '..', '..', 'deploy', 'perf-baseline.json');
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

const ENDPOINTS = [
    { name: 'GET /api/students',       method: 'GET', path: '/api/students' },
    { name: 'GET /api/sessions',       method: 'GET', path: '/api/sessions' },
    { name: 'GET /api/finance/stats',  method: 'GET', path: '/api/finance/stats' },
    { name: 'GET /api/notifications',  method: 'GET', path: '/api/notifications' },
    { name: 'GET /api/system/settings', method: 'GET', path: '/api/system/settings' },
];

async function measure(name, fn, runs = 3) {
    const times = [];
    for (let i = 0; i < runs; i++) {
        const start = Date.now();
        try {
            await fn();
        } catch { /* continue measuring */ }
        times.push(Date.now() - start);
    }
    times.sort((a, b) => a - b);
    return { avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length), min: times[0], max: times[times.length - 1] };
}

function api(method, path, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const opts = {
            method, hostname: url.hostname, port: url.port,
            path: url.pathname + url.search,
            headers: {},
            timeout: 15000,
        };
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;
        const req = http.request(opts, (res) => { res.resume(); res.on('end', resolve); });
        req.on('error', reject);
        req.end();
    });
}

async function check() {
    const checks = [];
    let warnings = 0, errors = 0;

    // Get token
    let token = null;
    try {
        const url = new URL('/api/auth/login', BASE_URL);
        const opts = { method: 'POST', hostname: url.hostname, port: url.port, path: '/api/auth/login', headers: { 'Content-Type': 'application/json' }, timeout: 10000 };
        const res = await new Promise((resolve, reject) => {
            const req = http.request(opts, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => { try { resolve(JSON.parse(data).token); } catch { resolve(null); } });
            });
            req.on('error', reject);
            req.write(JSON.stringify({ username: 'admin', password: 'admin' }));
            req.end();
        });
        token = res;
    } catch { /* no token */ }

    // Load baseline
    let baseline = {};
    try {
        if (fs.existsSync(BASELINE_PATH)) baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    } catch { /* no baseline */ }

    const results = {};

    for (const ep of ENDPOINTS) {
        const perf = await measure(ep.name, () => api(ep.method, ep.path, token));
        results[ep.name] = perf;

        const prev = baseline[ep.name];
        const status = prev
            ? (perf.avg <= prev.avg * 1.2 ? 'pass' : perf.avg <= prev.avg * 1.5 ? 'warn' : 'fail')
            : 'pass';

        let detail = `${perf.avg}ms avg (min=${perf.min}ms max=${perf.max}ms)`;
        if (prev) {
            const change = ((perf.avg - prev.avg) / prev.avg * 100);
            detail += ` | baseline: ${prev.avg}ms (${change >= 0 ? '+' : ''}${change.toFixed(1)}%)`;
            if (change > 50) errors++;
            else if (change > 20) warnings++;
        } else {
            detail += ` | no baseline (set with --record-baseline)`;
        }

        if (status === 'fail') errors++;
        else if (status === 'warn') warnings++;

        checks.push({ name: ep.name, status, detail });
    }

    // Save as baseline if --record-baseline
    if (process.argv.includes('--record-baseline')) {
        try {
            const dir = path.dirname(BASELINE_PATH);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(BASELINE_PATH, JSON.stringify(results, null, 2));
            checks.push({ name: 'Baseline saved', status: 'pass', detail: BASELINE_PATH });
        } catch (e) {
            checks.push({ name: 'Baseline save', status: 'warn', detail: e.message });
        }
    }

    const passed = checks.filter(c => c.status === 'pass').length;
    const total = checks.length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 100;

    return { name: 'Performance', score, checks, warnings, errors };
}

module.exports = { check };
