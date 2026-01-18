import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { unwrapZodType } from './unwrapZodType.js';

describe('unwrapZodType utility', () => {
  describe('basic types (no unwrapping needed)', () => {
    it('returns ZodString unchanged', () => {
      const schema = z.string();
      const result = unwrapZodType(schema);
      assert.equal(result, schema);
    });

    it('returns ZodNumber unchanged', () => {
      const schema = z.number();
      const result = unwrapZodType(schema);
      assert.equal(result, schema);
    });

    it('returns ZodObject unchanged', () => {
      const schema = z.object({ name: z.string() });
      const result = unwrapZodType(schema);
      assert.equal(result, schema);
    });

    it('returns ZodArray unchanged', () => {
      const schema = z.array(z.number());
      const result = unwrapZodType(schema);
      assert.equal(result, schema);
    });
  });

  describe('single wrapper unwrapping', () => {
    it('unwraps ZodOptional', () => {
      const inner = z.object({ port: z.number() });
      const schema = inner.optional();
      const result = unwrapZodType(schema);
      assert.equal(result, inner);
    });

    it('unwraps ZodNullable', () => {
      const inner = z.object({ port: z.number() });
      const schema = inner.nullable();
      const result = unwrapZodType(schema);
      assert.equal(result, inner);
    });

    it('unwraps ZodDefault', () => {
      const inner = z.object({ port: z.number() });
      const schema = inner.default({ port: 3000 });
      const result = unwrapZodType(schema);
      assert.equal(result, inner);
    });
  });

  describe('chained wrapper unwrapping', () => {
    it('unwraps optional + nullable', () => {
      const inner = z.object({ port: z.number() });
      const schema = inner.optional().nullable();
      const result = unwrapZodType(schema);
      assert.equal(result, inner);
    });

    it('unwraps optional + nullable + default', () => {
      const inner = z.object({ port: z.number() });
      const schema = inner.optional().nullable().default({ port: 3000 });
      const result = unwrapZodType(schema);
      assert.equal(result, inner);
    });

    it('unwraps deeply chained wrappers', () => {
      const inner = z.string();
      // Chain multiple wrappers
      const schema = inner.optional().nullable().optional().nullable();
      const result = unwrapZodType(schema);
      assert.equal(result, inner);
    });
  });

  describe('edge cases', () => {
    it('handles null input', () => {
      const result = unwrapZodType(null);
      assert.equal(result, null);
    });

    it('handles undefined input', () => {
      const result = unwrapZodType(undefined);
      assert.equal(result, undefined);
    });

    it('handles non-Zod objects', () => {
      const obj = { _def: { notInnerType: 'something' } };
      const result = unwrapZodType(obj);
      assert.equal(result, obj);
    });

    it('handles plain objects', () => {
      const obj = { name: 'test' };
      const result = unwrapZodType(obj);
      assert.equal(result, obj);
    });

    it('respects depth limit', () => {
      // Create a mock object that would cause infinite recursion
      const circular: Record<string, unknown> = { _def: {} };
      (circular._def as Record<string, unknown>).innerType = circular;

      // Should not throw - depth limit should prevent infinite recursion
      const result = unwrapZodType(circular);
      // After 100 iterations, it should return whatever it has
      assert.ok(result !== undefined);
    });
  });

  describe('instanceof checks after unwrapping', () => {
    it('unwrapped optional ZodObject is instanceof ZodObject', () => {
      const schema = z.object({ port: z.number() }).optional();
      const result = unwrapZodType(schema);
      assert.ok(result instanceof z.ZodObject);
    });

    it('unwrapped nullable ZodArray is instanceof ZodArray', () => {
      const schema = z.array(z.number()).nullable();
      const result = unwrapZodType(schema);
      assert.ok(result instanceof z.ZodArray);
    });

    it('unwrapped default ZodObject is instanceof ZodObject', () => {
      const schema = z.object({ port: z.number() }).default({ port: 3000 });
      const result = unwrapZodType(schema);
      assert.ok(result instanceof z.ZodObject);
    });
  });
});
