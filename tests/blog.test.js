import { describe, it, expect, beforeAll, afterAll } from 'vitest';
const request = require('supertest');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

describe('Blog API', () => {
    it('GET /api/blog returns paginated posts', async () => {
        const res = await request(BASE_URL).get('/api/blog?page=1&limit=5');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('posts');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page', 1);
        expect(Array.isArray(res.body.posts)).toBe(true);
    });

    it('GET /api/blog?all=true returns all posts', async () => {
        const res = await request(BASE_URL).get('/api/blog?all=true');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/blog/:slug returns a single post', async () => {
        const all = await request(BASE_URL).get('/api/blog?all=true');
        if (all.body.length > 0) {
            const slug = all.body[0].slug;
            const res = await request(BASE_URL).get(`/api/blog/${slug}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title');
            expect(res.body).toHaveProperty('slug', slug);
        }
    });

    it('GET /api/blog/nonexistent-slug returns 404', async () => {
        const res = await request(BASE_URL).get('/api/blog/this-slug-does-not-exist-12345');
        expect(res.status).toBe(404);
    });
});

describe('Health & SEO', () => {
    it('GET /health returns ok', async () => {
        const res = await request(BASE_URL).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('GET /sitemap.xml returns valid XML', async () => {
        const res = await request(BASE_URL).get('/sitemap.xml');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/xml/);
    });

    it('GET /robots.txt returns text', async () => {
        const res = await request(BASE_URL).get('/robots.txt');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Sitemap');
    });
});

describe('Rate Limiting', () => {
    it('rate limiter headers are present', async () => {
        const res = await request(BASE_URL).get('/api/blog?page=1&limit=1');
        expect(res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit']).toBeDefined();
    });
});
