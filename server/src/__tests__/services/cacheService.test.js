import { describe, it, expect, beforeEach, afterAll } from 'vitest';

const cache = require('../../../services/cacheService');

describe('cacheService', () => {

  beforeEach(() => {
    process.env.CACHE_MODE = 'memory';
    cache.clearAll();
  });

  afterAll(() => {
    cache.clearAll();
  });

  describe('get / set / del', () => {
    it('returns undefined for missing key', async () => {
      const val = await cache.get('missing');
      expect(val).toBeUndefined();
    });

    it('stores and retrieves a value', async () => {
      await cache.set('test:key', { hello: 'world' }, 60);
      const val = await cache.get('test:key');
      expect(val).toEqual({ hello: 'world' });
    });

    it('removes value after del', async () => {
      await cache.set('test:del', 'value', 60);
      await cache.del('test:del');
      const val = await cache.get('test:del');
      expect(val).toBeUndefined();
    });

    it('stores null values', async () => {
      await cache.set('test:null', null, 60);
      const val = await cache.get('test:null');
      expect(val).toBeNull();
    });
  });

  describe('wrap (single flight)', () => {
    it('returns value from loader on miss', async () => {
      const val = await cache.wrap('wrap:basic', 60, async () => 42);
      expect(val).toBe(42);
    });

    it('returns cached value on subsequent calls', async () => {
      let calls = 0;
      const loader = async () => { calls++; return Math.random(); };
      const v1 = await cache.wrap('wrap:cache', 60, loader);
      const v2 = await cache.wrap('wrap:cache', 60, loader);
      expect(v1).toBe(v2);
      expect(calls).toBe(1);
    });

    it('single flight: only one loader runs for concurrent requests', async () => {
      let calls = 0;
      const loader = async () => {
        calls++;
        await new Promise(r => setTimeout(r, 50));
        return 'result';
      };
      const promises = Array.from({ length: 20 }, () =>
        cache.wrap('wrap:singleflight', 60, loader)
      );
      const results = await Promise.all(promises);
      expect(results.every(r => r === 'result')).toBe(true);
      expect(calls).toBe(1);
    });

    it('single flight with null value: loader runs once', async () => {
      let calls = 0;
      const loader = async () => {
        calls++;
        return null;
      };
      const results = await Promise.all([
        cache.wrap('wrap:null', 60, loader),
        cache.wrap('wrap:null', 60, loader),
        cache.wrap('wrap:null', 60, loader),
      ]);
      expect(results.every(r => r === null)).toBe(true);
      expect(calls).toBe(1);
    });

    it('pass-through when CACHE_MODE=off', async () => {
      process.env.CACHE_MODE = 'off';
      let calls = 0;
      const loader = async () => { calls++; return 'fresh'; };
      const v1 = await cache.wrap('wrap:off', 60, loader);
      const v2 = await cache.wrap('wrap:off', 60, loader);
      expect(v1).toBe('fresh');
      expect(v2).toBe('fresh');
      expect(calls).toBe(2);
      process.env.CACHE_MODE = 'memory';
    });

    it('re-throws loader error', async () => {
      await expect(cache.wrap('wrap:error', 60, async () => {
        throw new Error('loader failed');
      })).rejects.toThrow('loader failed');
    });
  });

  describe('remember alias', () => {
    it('remember is wrap', async () => {
      expect(cache.remember).toBe(cache.wrap);
    });

    it('remember works the same as wrap', async () => {
      let calls = 0;
      const loader = async () => { calls++; return 'remembered'; };
      const v1 = await cache.remember('rem:test', 60, loader);
      const v2 = await cache.remember('rem:test', 60, loader);
      expect(v1).toBe('remembered');
      expect(v2).toBe('remembered');
      expect(calls).toBe(1);
    });
  });

  describe('invalidate', () => {
    it('invalidates keys matching pattern', async () => {
      await cache.set('test:a', 1, 60);
      await cache.set('test:b', 2, 60);
      await cache.set('other:c', 3, 60);
      await cache.invalidate('test:*');
      expect(await cache.get('test:a')).toBeUndefined();
      expect(await cache.get('test:b')).toBeUndefined();
      expect(await cache.get('other:c')).toBe(3);
    });

    it('invalidate increments counter', async () => {
      const before = cache.getMetrics().invalidations || 0;
      await cache.invalidate('dummy:*');
      expect(cache.getMetrics().invalidations).toBe(before + 1);
    });
  });

  describe('getMetrics', () => {
    it('returns mode=off when disabled', () => {
      process.env.CACHE_MODE = 'off';
      const m = cache.getMetrics();
      expect(m.mode).toBe('off');
      process.env.CACHE_MODE = 'memory';
    });

    it('includes hit rate after operations', async () => {
      await cache.get('metrics:miss');
      await cache.set('metrics:hit', 'x', 60);
      await cache.get('metrics:hit');
      const m = cache.getMetrics();
      expect(m.mode).toBe('memory');
      expect(m.hits).toBe(1);
      expect(m.misses).toBe(1);
      expect(m.hitRate).toBe('50.0');
      expect(m.keys).toBeGreaterThanOrEqual(1);
    });

    it('includes sets, deletes, invalidations counters', async () => {
      await cache.set('metrics:cnt', 1, 60);
      await cache.del('metrics:cnt');
      await cache.invalidate('metrics:*');
      const m = cache.getMetrics();
      expect(m.sets).toBeGreaterThanOrEqual(1);
      expect(m.deletes).toBeGreaterThanOrEqual(1);
      expect(m.invalidations).toBeGreaterThanOrEqual(1);
    });

    it('includes avgLoadTimeMs after wrap', async () => {
      await cache.wrap('metrics:load', 60, async () => {
        await new Promise(r => setTimeout(r, 5));
        return 'slow';
      });
      const m = cache.getMetrics();
      expect(m.avgLoadTimeMs).toBeDefined();
      expect(Number(m.avgLoadTimeMs)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMode', () => {
    it('returns current mode', () => {
      process.env.CACHE_MODE = 'memory';
      expect(cache.getMode()).toBe('memory');
      process.env.CACHE_MODE = 'off';
      expect(cache.getMode()).toBe('off');
      process.env.CACHE_MODE = 'redis';
      expect(cache.getMode()).toBe('redis');
    });

    it('defaults to off when not set', () => {
      delete process.env.CACHE_MODE;
      expect(cache.getMode()).toBe('off');
    });
  });
});
