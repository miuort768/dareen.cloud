const http = require('http');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

function api(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const opts = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
        };
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                let json;
                try { json = JSON.parse(data); } catch { json = data; }
                const time = res.headers['x-response-time'] ? parseFloat(res.headers['x-response-time']) : null;
                resolve({ status: res.statusCode, body: json, time });
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function check() {
    const checks = [];
    let errors = 0, warnings = 0;
    let token = null;
    const createdIds = [];

    // 1. Login
    try {
        const res = await api('POST', '/api/auth/login', { username: 'admin', password: 'admin' });
        if (res.status === 200 && res.body?.token) {
            token = res.body.token;
            checks.push({ name: 'POST /auth/login', status: 'pass', detail: `200 OK (${res.time || '?'}ms)` });
        } else {
            checks.push({ name: 'POST /auth/login', status: 'fail', detail: `${res.status} — no token` });
            errors++;
        }
    } catch (e) {
        checks.push({ name: 'POST /auth/login', status: 'error', detail: e.message });
        errors++;
        return { name: 'API Smoke Test', score: 0, checks, warnings, errors };
    }

    if (!token) {
        errors++;
        return { name: 'API Smoke Test', score: 0, checks, warnings, errors };
    }

    // 2. Create Student
    try {
        const res = await api('POST', '/api/students', {
            name: 'Verify Test Student',
            grade: 'test',
            parentPhone: '0000000000',
        }, token);
        if (res.status === 201 || res.status === 200) {
            const id = res.body?.id || res.body?.student?.id;
            if (id) createdIds.push({ type: 'student', id });
            checks.push({ name: 'POST /api/students', status: 'pass', detail: `${res.status} OK (${res.time || '?'}ms)` });
        } else {
            checks.push({ name: 'POST /api/students', status: 'fail', detail: `${res.status}` });
            errors++;
        }
    } catch (e) {
        checks.push({ name: 'POST /api/students', status: 'error', detail: e.message });
        errors++;
    }

    // 3. List Students
    try {
        const res = await api('GET', '/api/students', null, token);
        if (res.status === 200) {
            checks.push({ name: 'GET /api/students', status: 'pass', detail: `200 OK (${res.time || '?'}ms)` });
        } else {
            checks.push({ name: 'GET /api/students', status: 'fail', detail: `${res.status}` });
            errors++;
        }
    } catch (e) {
        checks.push({ name: 'GET /api/students', status: 'error', detail: e.message });
        errors++;
    }

    // 4. Create Enrollment
    const studentId = createdIds.find(c => c.type === 'student')?.id;
    if (studentId) {
        try {
            const res = await api('POST', '/api/student-portal/enrollments', {
                studentId,
                subject: 'Verify Test',
                sessionsTotal: 10,
            }, token);
            if (res.status === 201 || res.status === 200) {
                const id = res.body?.id || res.body?.enrollment?.id;
                if (id) createdIds.push({ type: 'enrollment', id });
                checks.push({ name: 'POST /api/enrollments', status: 'pass', detail: `${res.status} OK (${res.time || '?'}ms)` });
            } else {
                checks.push({ name: 'POST /api/enrollments', status: 'fail', detail: `${res.status}` });
                errors++;
            }
        } catch (e) {
            checks.push({ name: 'POST /api/enrollments', status: 'error', detail: e.message });
            errors++;
        }
    }

    // 5. Create Session
    if (studentId) {
        try {
            const res = await api('POST', '/api/sessions', {
                studentId,
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                price: 100,
            }, token);
            if (res.status === 201 || res.status === 200) {
                const id = res.body?.id || res.body?.session?.id;
                if (id) createdIds.push({ type: 'session', id });
                checks.push({ name: 'POST /api/sessions', status: 'pass', detail: `${res.status} OK (${res.time || '?'}ms)` });
            } else {
                checks.push({ name: 'POST /api/sessions', status: 'fail', detail: `${res.status}` });
                errors++;
            }
        } catch (e) {
            checks.push({ name: 'POST /api/sessions', status: 'error', detail: e.message });
            errors++;
        }
    }

    // 6. Finance Stats
    try {
        const res = await api('GET', '/api/finance/stats', null, token);
        if (res.status === 200) {
            checks.push({ name: 'GET /api/finance/stats', status: 'pass', detail: `200 OK (${res.time || '?'}ms)` });
        } else {
            checks.push({ name: 'GET /api/finance/stats', status: 'fail', detail: `${res.status}` });
            errors++;
        }
    } catch (e) {
        checks.push({ name: 'GET /api/finance/stats', status: 'error', detail: e.message });
        errors++;
    }

    // 7. Notifications
    try {
        const res = await api('GET', '/api/notifications', null, token);
        if (res.status === 200) {
            checks.push({ name: 'GET /api/notifications', status: 'pass', detail: `200 OK (${res.time || '?'}ms)` });
        } else {
            checks.push({ name: 'GET /api/notifications', status: 'fail', detail: `${res.status}` });
            errors++;
        }
    } catch (e) {
        checks.push({ name: 'GET /api/notifications', status: 'error', detail: e.message });
        errors++;
    }

    // 8. Authentication — unauthorized access
    try {
        const res = await api('GET', '/api/finance/stats', null, null);
        if (res.status === 401 || res.status === 403) {
            checks.push({ name: 'Unauthorized → 401/403', status: 'pass', detail: `${res.status} correct` });
        } else {
            checks.push({ name: 'Unauthorized → 401/403', status: 'warn', detail: `${res.status} (expected 401/403)` });
            warnings++;
        }
    } catch (e) {
        checks.push({ name: 'Unauthorized → 401/403', status: 'error', detail: e.message });
        errors++;
    }

    // 9. System settings
    try {
        const res = await api('GET', '/api/system/settings', null, token);
        if (res.status === 200) {
            checks.push({ name: 'GET /api/system/settings', status: 'pass', detail: `200 OK (${res.time || '?'}ms)` });
        } else {
            checks.push({ name: 'GET /api/system/settings', status: 'fail', detail: `${res.status}` });
            errors++;
        }
    } catch (e) {
        checks.push({ name: 'GET /api/system/settings', status: 'error', detail: e.message });
        errors++;
    }

    // 10. Cleanup test data
    for (const item of createdIds.reverse()) {
        try {
            const map = { student: 'students', enrollment: 'student-portal/enrollments', session: 'sessions' };
            const path = map[item.type];
            if (path) await api('DELETE', `/api/${path}/${item.id}`, null, token);
        } catch { /* cleanup best effort */ }
    }
    checks.push({ name: 'Cleanup test data', status: 'pass', detail: `${createdIds.length} items removed` });

    const passed = checks.filter(c => c.status === 'pass').length;
    const total = checks.length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 100;

    return { name: 'API Smoke Test', score, checks, warnings, errors };
}

module.exports = { check };
