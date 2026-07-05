import { describe, it, expect } from 'vitest';
const { parseItems, serializeItems } = require('../../../services/invoiceHelpers');

describe('invoiceHelpers', () => {
  describe('parseItems', () => {
    it('returns empty array for null/undefined', () => {
      expect(parseItems(null)).toEqual([]);
      expect(parseItems(undefined)).toEqual([]);
    });

    it('returns array as-is', () => {
      const items = [{ name: 'test', price: 100 }];
      expect(parseItems(items)).toBe(items);
    });

    it('parses JSON string', () => {
      const items = [{ name: 'test', price: 100 }];
      expect(parseItems(JSON.stringify(items))).toEqual(items);
    });

    it('returns empty array for invalid JSON', () => {
      expect(parseItems('not-json')).toEqual([]);
    });
  });

  describe('serializeItems', () => {
    it('returns null for null/undefined', () => {
      expect(serializeItems(null)).toBeNull();
      expect(serializeItems(undefined)).toBeNull();
    });

    it('returns string as-is', () => {
      expect(serializeItems('string')).toBe('string');
    });

    it('serializes array to JSON string', () => {
      const items = [{ name: 'test' }];
      expect(serializeItems(items)).toBe(JSON.stringify(items));
    });
  });
});
