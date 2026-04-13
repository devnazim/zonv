import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

const readBuiltFile = async (relativePath: string): Promise<string> => {
  return readFile(resolve(process.cwd(), 'dist', relativePath), 'utf8');
};

describe('published entrypoint compatibility', () => {
  it('keeps env-config entrypoints free of file loader imports', async () => {
    const [envConfigV3, envConfigV4, envConfigV3Cjs, envConfigV4Cjs, envLoader, envLoaderCjs] = await Promise.all([
      readBuiltFile('./env-config-v3.js'),
      readBuiltFile('./env-config-v4.js'),
      readBuiltFile('./cjs/env-config-v3.cjs'),
      readBuiltFile('./cjs/env-config-v4.cjs'),
      readBuiltFile('./core/env-loader.js'),
      readBuiltFile('./cjs/core/env-loader.cjs'),
    ]);

    for (const content of [envConfigV3, envConfigV4, envConfigV3Cjs, envConfigV4Cjs, envLoader, envLoaderCjs]) {
      assert.doesNotMatch(content, /node:fs/);
      assert.doesNotMatch(content, /node:fs\/promises/);
      assert.doesNotMatch(content, /getFileContent/);
    }

    for (const content of [envConfigV3, envConfigV4, envConfigV3Cjs, envConfigV4Cjs]) {
      assert.doesNotMatch(content, /config-loader/);
    }
  });

  it('keeps zod v3 entrypoints free of zod/v3 imports', async () => {
    const files = await Promise.all([
      readBuiltFile('./config-v3.js'),
      readBuiltFile('./env-config-v3.js'),
      readBuiltFile('./cjs/config-v3.cjs'),
      readBuiltFile('./cjs/env-config-v3.cjs'),
      readBuiltFile('./core/zod-v3-adapter.js'),
      readBuiltFile('./cjs/core/zod-v3-adapter.cjs'),
      readBuiltFile('./config-v3.d.ts'),
      readBuiltFile('./env-config-v3.d.ts'),
    ]);

    for (const content of files) {
      assert.doesNotMatch(content, /zod\/v3/);
    }
  });
});
