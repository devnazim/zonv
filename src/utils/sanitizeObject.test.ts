import assert from 'node:assert';
import { describe, it } from 'node:test';

import { sanitizeObject } from './sanitizeObject.js';

describe('sanitizeObject utility', () => {
  describe('basic functionality', () => {
    it('passes through safe objects unchanged', () => {
      const obj = { name: 'test', port: 3000 };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, obj);
    });

    it('passes through nested safe objects', () => {
      const obj = { server: { port: 3000, host: 'localhost' } };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, obj);
    });

    it('passes through arrays unchanged', () => {
      const obj = { items: [1, 2, 3], nested: { arr: ['a', 'b'] } };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, obj);
    });
  });

  describe('prototype pollution prevention', () => {
    it('removes __proto__ key', () => {
      const obj = { __proto__: { polluted: true }, safe: 'value' };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, { safe: 'value' });
      assert.equal(({} as Record<string, unknown>).polluted, undefined);
    });

    it('removes constructor key', () => {
      const obj = { constructor: { prototype: { bad: true } }, safe: 'value' };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, { safe: 'value' });
    });

    it('removes prototype key', () => {
      const obj = { prototype: { evil: true }, safe: 'value' };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, { safe: 'value' });
    });

    it('removes dangerous keys from nested objects', () => {
      const obj = {
        config: {
          __proto__: { bad: true },
          port: 3000,
        },
        safe: 'value',
      };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, {
        config: { port: 3000 },
        safe: 'value',
      });
    });

    it('removes multiple dangerous keys', () => {
      const obj = {
        __proto__: { a: 1 },
        constructor: { b: 2 },
        prototype: { c: 3 },
        safe: 'value',
      };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, { safe: 'value' });
    });

    it('handles deeply nested dangerous keys', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              __proto__: { polluted: true },
              value: 'deep',
            },
          },
        },
      };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty object', () => {
      const result = sanitizeObject({});
      assert.deepEqual(result, {});
    });

    it('preserves null values', () => {
      const obj = { value: null };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, { value: null });
    });

    it('preserves undefined values', () => {
      const obj = { value: undefined };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, { value: undefined });
    });

    it('preserves primitive values', () => {
      const obj = {
        string: 'test',
        number: 123,
        boolean: true,
        null: null,
      };
      const result = sanitizeObject(obj);
      assert.deepEqual(result, obj);
    });

    it('does not modify original object', () => {
      const obj = { __proto__: { bad: true }, safe: 'value' };
      const original = { ...obj };
      sanitizeObject(obj);
      assert.deepEqual(obj, original);
    });
  });
});
