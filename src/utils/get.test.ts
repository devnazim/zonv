import assert from 'node:assert';
import { describe, it } from 'node:test';

import { get } from './get.js';

describe('get utility', () => {
  describe('basic functionality', () => {
    it('gets top-level property', () => {
      const obj = { name: 'test', value: 123 };
      assert.equal(get(obj, 'name'), 'test');
      assert.equal(get(obj, 'value'), 123);
    });

    it('gets nested property with dot notation', () => {
      const obj = { server: { port: 3000, host: 'localhost' } };
      assert.equal(get(obj, 'server.port'), 3000);
      assert.equal(get(obj, 'server.host'), 'localhost');
    });

    it('gets deeply nested property', () => {
      const obj = { a: { b: { c: { d: 'deep' } } } };
      assert.equal(get(obj, 'a.b.c.d'), 'deep');
    });

    it('gets property using array path', () => {
      const obj = { server: { port: 3000 } };
      assert.equal(get(obj, ['server', 'port']), 3000);
    });
  });

  describe('edge cases', () => {
    it('returns undefined for non-existent property', () => {
      const obj = { name: 'test' };
      assert.equal(get(obj, 'missing'), undefined);
    });

    it('returns undefined for non-existent nested property', () => {
      const obj = { server: { port: 3000 } };
      assert.equal(get(obj, 'server.missing'), undefined);
      assert.equal(get(obj, 'missing.nested'), undefined);
    });

    it('returns undefined for null object', () => {
      assert.equal(get(null, 'path'), undefined);
    });

    it('returns undefined for undefined object', () => {
      assert.equal(get(undefined, 'path'), undefined);
    });

    it('returns undefined for non-object', () => {
      assert.equal(get('string', 'path'), undefined);
      assert.equal(get(123, 'path'), undefined);
      assert.equal(get(true, 'path'), undefined);
    });

    it('returns undefined for empty path', () => {
      const obj = { name: 'test' };
      assert.equal(get(obj, ''), undefined);
    });

    it('returns object itself for empty array path', () => {
      const obj = { name: 'test' };
      // Empty array path returns the object itself (no traversal)
      assert.deepEqual(get(obj, []), obj);
    });

    it('handles array access with numeric string', () => {
      const obj = { items: ['a', 'b', 'c'] };
      assert.equal(get(obj, 'items.0'), 'a');
      assert.equal(get(obj, 'items.1'), 'b');
    });

    it('handles null values in path', () => {
      const obj = { server: null };
      assert.equal(get(obj, 'server.port'), undefined);
    });
  });
});
