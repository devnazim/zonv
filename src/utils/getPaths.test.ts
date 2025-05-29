import assert from 'node:assert';
import { describe, it } from 'node:test';
import { cwd } from 'node:process';
import { resolve } from 'node:path';

import { getPaths } from './getPaths.js';

describe('get config paths', () => {
  it('use default value: ', () => {
    const configPaths = getPaths({ type: 'config' });
    const secretsPaths = getPaths({ type: 'secrets' });
    assert.deepEqual(configPaths, [resolve(cwd(), './config/config.json')]);
    assert.deepEqual(secretsPaths, [resolve(cwd(), './secrets/secrets.json')]);
  });
  it('use default value with zonfig ENV: ', () => {
    const configPaths = getPaths({ type: 'config', env: 'dev' });
    const secretsPaths = getPaths({ type: 'secrets', env: 'dev' });
    assert.deepEqual(configPaths, [resolve(cwd(), './config/dev.config.json')]);
    assert.deepEqual(secretsPaths, [resolve(cwd(), './secrets/dev.secrets.json')]);
  });
  it('use explicitly defined path: ', () => {
    const configPath = resolve(cwd(), './custom/config/path/config.json');
    const secretsPath = resolve(cwd(), './custom/secrets/path/secrets.json');
    const configPaths = getPaths({ type: 'config', path: configPath, env: 'prod' });
    const secretsPaths = getPaths({ type: 'secrets', path: secretsPath, env: 'prod' });
    assert.deepEqual(configPaths, [configPath]);
    assert.deepEqual(secretsPaths, [secretsPath]);
  });
  it('use multiple config paths: ', () => {
    const configPath = [resolve(cwd(), './custom/config/path/config1.json'), resolve(cwd(), './custom/config/path/config2.json')];
    const secretsPath = [resolve(cwd(), './custom/secrets/path1/my-secret1.json'), resolve(cwd(), './custom/secrets/path2/my-secret2.json')];
    const configPaths = getPaths({ type: 'config', path: configPath, env: 'prod' });
    const secretsPaths = getPaths({ type: 'secrets', path: secretsPath, env: 'prod' });
    assert.deepEqual(configPaths, configPath);
    assert.deepEqual(secretsPaths, secretsPath);
  });
});
