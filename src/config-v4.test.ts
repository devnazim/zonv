import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import merge from 'lodash.merge';

import { getConfig, getConfigAsync } from './config-v4.js';
import { getConfigFromEnv } from './env-config-v4.js';
import { createConfigFiles } from './test-utils.js';

describe('getConfig with zod/v4', { concurrency: false }, () => {
  describe('validate schema without secrets', () => {
    const schema = z.object({
      name: z.string(),
      birthYear: z.number().optional(),
      nested: z.object({ foo: z.number(), bar: z.string(), baz: z.array(z.number()) }),
      arr: z.array(z.object({ id: z.coerce.number(), val: z.coerce.string() })),
    });
    it('valid data', async () => {
      const path = './tmp/test/config.json';
      const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfig({ schema, configPath: [path] });
        assert.deepEqual(data, config);
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
      }
    });
    it('valid data without optional fields', async () => {
      const path = './tmp/test/config.json';
      const data = { name: 'foo', nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfig({ schema, configPath: [path] });
        assert.deepEqual(data, config);
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
      }
    });
    it('convert values type', async () => {
      const path = './tmp/test/config.json';
      const data = { name: 'foo', nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: '1', val: 123 }] };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfig({ schema, configPath: [path] });
        assert.deepEqual(
          config.arr,
          data.arr.map(({ id, val }) => ({ id: Number(id), val: String(val) }))
        );
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
      }
    });
    it('override field', async () => {
      const path = './tmp/test/config.json';
      const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
      const overrideName = 'bar';
      process.env.name = overrideName;
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfig({ schema, configPath: [path] });
        assert.equal(config.name, overrideName);
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
        delete process.env.name;
      }
    });
    it('override nested field', async () => {
      const path = './tmp/test/config.json';
      const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
      const nestedBar = 'foo';
      process.env['nested___bar'] = nestedBar;
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfig({ schema, configPath: [path] });
        assert.equal(config.nested.bar, nestedBar);
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
        delete process.env['nested___bar'];
      }
    });
    it('override object', async () => {
      const path = './tmp/test/config.json';
      const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
      const nested = { foo: 2, bar: 'xys', baz: [5, 6, 7] };
      process.env.nested = JSON.stringify(nested);
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfig({ schema, configPath: [path] });
        assert.deepEqual(config.nested, nested);
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
        delete process.env.nested;
      }
    });
    it('override array', async () => {
      const path = './tmp/test/config.json';
      const data = { name: 'foo', birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
      const arr = [
        { id: 10, val: 'abcd' },
        { id: 20, val: 'xyz' },
      ];
      process.env.arr = JSON.stringify(arr);
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfig({ schema, configPath: [path] });
        assert.deepEqual(config.arr, arr);
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
        delete process.env.arr;
      }
    });
    it('add missing data with env', async () => {
      const path = './tmp/test/config.json';
      const data = { birthYear: 2000, nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
      const overrideName = 'bar';
      process.env.name = overrideName;
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfig({ schema, configPath: [path] });
        assert.equal(config.name, overrideName);
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
        delete process.env.name;
      }
    });
    it('load data from multiple files', async () => {
      const path1 = './tmp/test/config1.json';
      const data1 = { name: 'foo', birthYear: 2000 };
      const path2 = './tmp/test/config2.json';
      const data2 = { nested: { foo: 1, bar: 'abcd', baz: [1, 2, 3] }, arr: [{ id: 1, val: 'foo' }] };
      const { cleanup: cleanup1 } = await createConfigFiles([{ path: path1, data: data1 }]);
      const { cleanup: cleanup2 } = await createConfigFiles([{ path: path2, data: data2 }]);
      try {
        const config = await getConfig({ schema, configPath: [path1, path2] });
        assert.deepEqual(merge(data1, data2), config);
      } catch (e) {
        throw e;
      } finally {
        await cleanup1();
        await cleanup2();
      }
    });
  });

  describe('validate schema with secrets', () => {
    const schema = z.object({ zone: z.string(), API_KEY: z.string() });
    it('valid data', async () => {
      const configPath = './tmp/test/config.json';
      const secretsPath = './tmp/test/secret.json';
      const configData = { zone: 'us' };
      const secretsData = { API_KEY: 'abcd' };
      const { cleanup } = await createConfigFiles([
        { path: configPath, data: configData },
        { path: secretsPath, data: secretsData },
      ]);
      try {
        const config = await getConfig({ schema, configPath, secretsPath });
        assert.deepEqual(merge(configData, secretsData), config);
      } catch (e) {
        throw e;
      } finally {
        await cleanup();
      }
    });
  });

  describe('getConfigFromEnv', () => {
    it('get config from env', () => {
      const envVariables = [
        { key: 'FOO', value: 'foo' },
        { key: 'BAR', value: 'bar' },
        { key: 'NESTED___BAZ', value: 'baz' },
      ];
      for (const envVariable of envVariables) {
        process.env[envVariable.key] = envVariable.value;
      }
      try {
        const schema = z.object({
          FOO: z.string(),
          BAR: z.string().optional(),
          NESTED: z.object({ BAZ: z.string() }),
        });
        const config = getConfigFromEnv({ schema });
        assert.equal(config.FOO, 'foo');
        assert.equal(config.NESTED.BAZ, 'baz');
      } catch (e) {
        throw e;
      } finally {
        for (const envVariable of envVariables) {
          delete process.env[envVariable.key];
        }
      }
    });
  });

  describe('wrapped types (optional, nullable, default)', () => {
    it('handles optional nested object', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        server: z.object({ port: z.coerce.number(), host: z.string() }).optional(),
      });
      const data = { name: 'test', server: { port: 3000, host: 'localhost' } };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        // Override nested value via env
        process.env['server___port'] = '8080';
        const config = getConfig({ schema, configPath: [path] });
        assert.equal(config.server?.port, 8080);
        assert.equal(config.server?.host, 'localhost');
      } finally {
        delete process.env['server___port'];
        await cleanup();
      }
    });

    it('handles nullable nested object', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        server: z.object({ port: z.coerce.number() }).nullable(),
      });
      const data = { name: 'test', server: { port: 3000 } };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        process.env['server___port'] = '9000';
        const config = getConfig({ schema, configPath: [path] });
        assert.equal(config.server?.port, 9000);
      } finally {
        delete process.env['server___port'];
        await cleanup();
      }
    });

    it('handles default nested object', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        server: z.object({ port: z.coerce.number() }).default({ port: 3000 }),
      });
      const data = { name: 'test' };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        process.env['server___port'] = '5000';
        const config = getConfig({ schema, configPath: [path] });
        assert.equal(config.server.port, 5000);
      } finally {
        delete process.env['server___port'];
        await cleanup();
      }
    });

    it('handles optional array', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        items: z.array(z.number()).optional(),
      });
      const data = { name: 'test', items: [1, 2, 3] };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        process.env['items'] = '[4, 5, 6]';
        const config = getConfig({ schema, configPath: [path] });
        assert.deepEqual(config.items, [4, 5, 6]);
      } finally {
        delete process.env['items'];
        await cleanup();
      }
    });

    it('handles chained wrappers (optional + nullable + default)', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        server: z.object({ port: z.coerce.number() }).optional().nullable().default({ port: 3000 }),
      });
      const data = { name: 'test' };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        process.env['server___port'] = '7777';
        const config = getConfig({ schema, configPath: [path] });
        assert.equal(config.server?.port, 7777);
      } finally {
        delete process.env['server___port'];
        await cleanup();
      }
    });
  });

  describe('edge cases', () => {
    it('ignores empty string env values', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        value: z.string().default('default'),
      });
      const data = { name: 'test', value: 'from-file' };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        process.env['value'] = '';
        const config = getConfig({ schema, configPath: [path] });
        assert.equal(config.value, 'from-file'); // Should not be overridden by empty string
      } finally {
        delete process.env['value'];
        await cleanup();
      }
    });

    it('handles whitespace-only config file as empty', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string().default('default-name'),
      });
      const { cleanup } = await createConfigFiles([{ path, data: {} }]);
      const fs = await import('node:fs/promises');
      await fs.writeFile(path, '   \n\t  \n  ');
      try {
        const config = getConfig({ schema, configPath: [path] });
        assert.equal(config.name, 'default-name'); // Should use default since file is empty
      } finally {
        await cleanup();
      }
    });

    it('throws on invalid JSON config file', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({ name: z.string() });
      // Create file with invalid JSON
      const { cleanup } = await createConfigFiles([{ path, data: {} }]);
      const fs = await import('node:fs/promises');
      await fs.writeFile(path, 'not valid json');
      try {
        assert.throws(() => getConfig({ schema, configPath: [path] }), /Failed to parse JSON/);
      } finally {
        await cleanup();
      }
    });

    it('throws on array config file', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({ name: z.string() });
      const { cleanup } = await createConfigFiles([{ path, data: {} }]);
      const fs = await import('node:fs/promises');
      await fs.writeFile(path, '[1, 2, 3]');
      try {
        assert.throws(() => getConfig({ schema, configPath: [path] }), /must contain a JSON object, but got array/);
      } finally {
        await cleanup();
      }
    });

    it('throws on string config file', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({ name: z.string() });
      const { cleanup } = await createConfigFiles([{ path, data: {} }]);
      const fs = await import('node:fs/promises');
      await fs.writeFile(path, '"just a string"');
      try {
        assert.throws(() => getConfig({ schema, configPath: [path] }), /must contain a JSON object, but got string/);
      } finally {
        await cleanup();
      }
    });

    it('throws on null config file', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({ name: z.string() });
      const { cleanup } = await createConfigFiles([{ path, data: {} }]);
      const fs = await import('node:fs/promises');
      await fs.writeFile(path, 'null');
      try {
        assert.throws(() => getConfig({ schema, configPath: [path] }), /must contain a JSON object, but got null/);
      } finally {
        await cleanup();
      }
    });

    it('throws on invalid JSON in env var for object type', () => {
      const schema = z.object({
        server: z.object({ port: z.number() }),
      });
      process.env['server'] = 'not valid json';
      try {
        assert.throws(() => getConfigFromEnv({ schema }), /Failed to parse environment variable "server"/);
      } finally {
        delete process.env['server'];
      }
    });

    it('handles deeply nested schema (3+ levels)', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              value: z.string(),
            }),
          }),
        }),
      });
      const data = { level1: { level2: { level3: { value: 'deep' } } } };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        process.env['level1___level2___level3___value'] = 'overridden';
        const config = getConfig({ schema, configPath: [path] });
        assert.equal(config.level1.level2.level3.value, 'overridden');
      } finally {
        delete process.env['level1___level2___level3___value'];
        await cleanup();
      }
    });
  });

  describe('custom delimiter', () => {
    it('throws on empty delimiter', () => {
      const schema = z.object({ name: z.string() });
      assert.throws(() => getConfig({ schema, configPath: [], delimiter: '' }), /Delimiter cannot be an empty string/);
    });

    it('uses custom delimiter for nested env vars', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        server: z.object({ port: z.coerce.number(), host: z.string() }),
      });
      const data = { server: { port: 3000, host: 'localhost' } };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        // Use double underscore instead of triple
        process.env['server__port'] = '9999';
        const config = getConfig({ schema, configPath: [path], delimiter: '__' });
        assert.equal(config.server.port, 9999);
        assert.equal(config.server.host, 'localhost');
      } finally {
        delete process.env['server__port'];
        await cleanup();
      }
    });

    it('uses custom delimiter with getConfigFromEnv', () => {
      const schema = z.object({
        database: z.object({ host: z.string(), port: z.coerce.number() }),
      });
      process.env['database__host'] = 'db.example.com';
      process.env['database__port'] = '5432';
      try {
        const config = getConfigFromEnv({ schema, delimiter: '__' });
        assert.equal(config.database.host, 'db.example.com');
        assert.equal(config.database.port, 5432);
      } finally {
        delete process.env['database__host'];
        delete process.env['database__port'];
      }
    });

    it('uses custom delimiter with getConfigAsync', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        api: z.object({ key: z.string() }),
      });
      const data = { api: { key: 'from-file' } };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        process.env['api.key'] = 'from-env';
        const config = await getConfigAsync({ schema, configPath: [path], delimiter: '.' });
        assert.equal(config.api.key, 'from-env');
      } finally {
        delete process.env['api.key'];
        await cleanup();
      }
    });
  });

  describe('getConfigAsync', () => {
    it('loads config asynchronously', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        port: z.coerce.number(),
      });
      const data = { name: 'async-test', port: 3000 };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const config = await getConfigAsync({ schema, configPath: [path] });
        assert.equal(config.name, 'async-test');
        assert.equal(config.port, 3000);
      } finally {
        await cleanup();
      }
    });

    it('loads multiple files in parallel', async () => {
      const path1 = './tmp/test/config1.json';
      const path2 = './tmp/test/config2.json';
      const schema = z.object({
        name: z.string(),
        port: z.coerce.number(),
      });
      const data1 = { name: 'from-file1' };
      const data2 = { port: 8080 };
      const { cleanup: cleanup1 } = await createConfigFiles([{ path: path1, data: data1 }]);
      const { cleanup: cleanup2 } = await createConfigFiles([{ path: path2, data: data2 }]);
      try {
        const config = await getConfigAsync({ schema, configPath: [path1, path2] });
        assert.equal(config.name, 'from-file1');
        assert.equal(config.port, 8080);
      } finally {
        await cleanup1();
        await cleanup2();
      }
    });

    it('applies env vars after loading files', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        port: z.coerce.number(),
      });
      const data = { name: 'test', port: 3000 };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        process.env['port'] = '9999';
        const config = await getConfigAsync({ schema, configPath: [path] });
        assert.equal(config.name, 'test');
        assert.equal(config.port, 9999);
      } finally {
        delete process.env['port'];
        await cleanup();
      }
    });

    it('returns same result as sync version', async () => {
      const path = './tmp/test/config.json';
      const schema = z.object({
        name: z.string(),
        nested: z.object({ value: z.coerce.number() }),
      });
      const data = { name: 'compare-test', nested: { value: 42 } };
      const { cleanup } = await createConfigFiles([{ path, data }]);
      try {
        const syncConfig = getConfig({ schema, configPath: [path] });
        const asyncConfig = await getConfigAsync({ schema, configPath: [path] });
        assert.deepEqual(syncConfig, asyncConfig);
      } finally {
        await cleanup();
      }
    });
  });
});
