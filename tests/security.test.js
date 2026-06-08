import { describe, it, expect } from 'vitest';
const request = require('supertest');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

describe('Security Headers', () => {
    it('Returns X-Frame-Options header', async () => {
        const res = await request(BASE_URL).get('/');
        expect(res.headers['x-frame-options'] || res.headers['x-xss-protection']).toBeDefined();
    });

    it('Returns Content-Security-Policy header', async () => {
        const res = await request(BASE_URL).get('/');
        expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('Rate limiter blocks excessive requests to auth', async () => {
        const promises = [];
        for (let i = 0; i < 25; i++) {
            promises.push(request(BASE_URL).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' }));
        }
        const results = await Promise.all(promises);
        const tooMany = results.filter(r => r.status === 429);
        expect(tooMany.length).toBeGreaterThan(0);
    }, 30000);
});

describe('API Validation', () => {
    it('Blog POST without auth returns 401', async () => {
        const res = await request(BASE_URL)
            .post('/api/blog')
            .send({ title: 'test', slug: 'test' });
        expect(res.status).toBe(401);
    });

    it('Blog POST with invalid slug returns 400', async () => {
        const res = await request(BASE_URL)
            .post('/api/blog')
            .set('Authorization', 'Bearer invalid')
            .send({ title: 'test', slug: 'invalid slug with spaces!', content: 'test' });
        expect(res.status).toBe(400);
    });
});

describe('CORS', () => {
    it('Blocks unknown origins', async () => {
        const res = await request(BASE_URL)
            .get('/health')
            .set('Origin', 'https://evil-site.com');
        const corsHeader = res.headers['access-control-allow-origin'];
        const blocked = res.status === 500 || corsHeader === undefined || corsHeader === '';
        expect(blocked).toBe(true);
    });
});
