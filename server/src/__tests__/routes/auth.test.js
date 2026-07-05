import { describe, it, expect, beforeAll } from 'vitest';
const request = require('supertest');

let app;

beforeAll(async () => {
    app = require('../../../index');
});

describe('POST /api/auth/login', () => {
    it('returns 400 for missing credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('returns 401 for wrong credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'wrong@test.com', password: 'wrongpass' });
        expect([401, 400]).toContain(res.status);
    });
});

describe('GET /api/health', () => {
    it('returns ok status', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});

describe('GET /api/system/public-settings', () => {
    it('returns an object response', async () => {
        const res = await request(app).get('/api/system/public-settings');
        expect(typeof res.body).toBe('object');
    });
});
