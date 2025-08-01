import assert from 'node:assert';
import { describe, it } from 'node:test';
import { writeFile, unlink, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, sep } from 'node:path';
import { z } from 'zod/v3';
import merge from 'lodash.merge';

import { getConfig } from './config-v3.js';
import { getConfigFromEnv } from './env-config-v3.js';

export const createConfigFiles = async (files: { path: string; data: any }[]) => {
  const dirToDelete: string[] = [];
  for (const file of files) {
    const dir = dirname(file.path);
    const paths = dir.split(sep);
    const nestedPaths = [];
    let currentPath: string[] = [];
    for (const path of paths) {
      currentPath.push(path);
      const currentDir = currentPath.join(sep);
      if (existsSync(currentDir) === false) {
        nestedPaths.push(currentDir);
        await mkdir(currentDir);
      }
    }
    dirToDelete.push(...nestedPaths.reverse());
    await writeFile(file.path, JSON.stringify(file.data, null, 2));
  }
  return {
    cleanup: async () => {
      for (const file of files) {
        if (existsSync(file.path)) {
          await unlink(file.path);
        }
      }
      for (const dir of dirToDelete) {
        if (existsSync(dir)) {
          await rm(dir, { recursive: true });
        }
      }
    },
  };
};

describe('getConfig', { concurrency: false }, () => {
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
});
