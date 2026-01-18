import assert from 'node:assert';
import { describe, it } from 'node:test';
import { writeFile, unlink, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import { getFileContent, getFileContentAsync } from './getFileContent.js';

describe('getFileContent utility', () => {
  const testDir = './tmp/test-getFileContent';
  const testFile = `${testDir}/config.json`;

  // Helper to create test file
  const createTestFile = async (content: string) => {
    if (!existsSync(testDir)) {
      await mkdir(testDir, { recursive: true });
    }
    await writeFile(testFile, content);
  };

  // Helper to cleanup
  const cleanup = async () => {
    if (existsSync(testFile)) {
      await unlink(testFile);
    }
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true });
    }
  };

  describe('successful file reading', () => {
    it('reads and parses valid JSON object', async () => {
      await createTestFile('{"name": "test", "port": 3000}');
      try {
        const result = getFileContent(testFile);
        assert.deepEqual(result, { name: 'test', port: 3000 });
      } finally {
        await cleanup();
      }
    });

    it('reads nested JSON objects', async () => {
      await createTestFile('{"server": {"port": 3000, "host": "localhost"}}');
      try {
        const result = getFileContent(testFile);
        assert.deepEqual(result, { server: { port: 3000, host: 'localhost' } });
      } finally {
        await cleanup();
      }
    });

    it('reads JSON with arrays', async () => {
      await createTestFile('{"items": [1, 2, 3]}');
      try {
        const result = getFileContent(testFile);
        assert.deepEqual(result, { items: [1, 2, 3] });
      } finally {
        await cleanup();
      }
    });
  });

  describe('missing file handling', () => {
    it('returns empty object for non-existent file', () => {
      const result = getFileContent('./non-existent-file.json');
      assert.deepEqual(result, {});
    });
  });

  describe('empty file handling', () => {
    it('returns empty object for empty file', async () => {
      await createTestFile('');
      try {
        const result = getFileContent(testFile);
        assert.deepEqual(result, {});
      } finally {
        await cleanup();
      }
    });

    it('returns empty object for whitespace-only file', async () => {
      await createTestFile('   \n\t  \n  ');
      try {
        const result = getFileContent(testFile);
        assert.deepEqual(result, {});
      } finally {
        await cleanup();
      }
    });
  });

  describe('invalid JSON handling', () => {
    it('throws on invalid JSON', async () => {
      await createTestFile('not valid json');
      try {
        assert.throws(() => getFileContent(testFile), /Failed to parse JSON/);
      } finally {
        await cleanup();
      }
    });

    it('throws on JSON array', async () => {
      await createTestFile('[1, 2, 3]');
      try {
        assert.throws(() => getFileContent(testFile), /must contain a JSON object, but got array/);
      } finally {
        await cleanup();
      }
    });

    it('throws on JSON string', async () => {
      await createTestFile('"just a string"');
      try {
        assert.throws(() => getFileContent(testFile), /must contain a JSON object, but got string/);
      } finally {
        await cleanup();
      }
    });

    it('throws on JSON null', async () => {
      await createTestFile('null');
      try {
        assert.throws(() => getFileContent(testFile), /must contain a JSON object, but got null/);
      } finally {
        await cleanup();
      }
    });

    it('throws on JSON number', async () => {
      await createTestFile('123');
      try {
        assert.throws(() => getFileContent(testFile), /must contain a JSON object, but got number/);
      } finally {
        await cleanup();
      }
    });
  });

  describe('prototype pollution prevention', () => {
    it('sanitizes __proto__ from config', async () => {
      await createTestFile('{"__proto__": {"polluted": true}, "safe": "value"}');
      try {
        const result = getFileContent(testFile);
        assert.deepEqual(result, { safe: 'value' });
        // Verify prototype wasn't polluted
        assert.equal(({} as Record<string, unknown>).polluted, undefined);
      } finally {
        await cleanup();
      }
    });

    it('sanitizes constructor from config', async () => {
      await createTestFile('{"constructor": {"bad": true}, "safe": "value"}');
      try {
        const result = getFileContent(testFile);
        assert.deepEqual(result, { safe: 'value' });
      } finally {
        await cleanup();
      }
    });

    it('sanitizes nested dangerous keys', async () => {
      await createTestFile('{"config": {"__proto__": {"bad": true}, "port": 3000}}');
      try {
        const result = getFileContent(testFile);
        assert.deepEqual(result, { config: { port: 3000 } });
      } finally {
        await cleanup();
      }
    });
  });

  describe('getFileContentAsync', () => {
    it('reads and parses valid JSON object asynchronously', async () => {
      await createTestFile('{"name": "async-test", "port": 8080}');
      try {
        const result = await getFileContentAsync(testFile);
        assert.deepEqual(result, { name: 'async-test', port: 8080 });
      } finally {
        await cleanup();
      }
    });

    it('returns empty object for non-existent file', async () => {
      const result = await getFileContentAsync('./non-existent-async-file.json');
      assert.deepEqual(result, {});
    });

    it('returns empty object for empty file', async () => {
      await createTestFile('');
      try {
        const result = await getFileContentAsync(testFile);
        assert.deepEqual(result, {});
      } finally {
        await cleanup();
      }
    });

    it('throws on invalid JSON', async () => {
      await createTestFile('not valid json');
      try {
        await assert.rejects(getFileContentAsync(testFile), /Failed to parse JSON/);
      } finally {
        await cleanup();
      }
    });

    it('throws on JSON array', async () => {
      await createTestFile('[1, 2, 3]');
      try {
        await assert.rejects(getFileContentAsync(testFile), /must contain a JSON object, but got array/);
      } finally {
        await cleanup();
      }
    });

    it('sanitizes dangerous keys', async () => {
      await createTestFile('{"__proto__": {"bad": true}, "safe": "value"}');
      try {
        const result = await getFileContentAsync(testFile);
        assert.deepEqual(result, { safe: 'value' });
      } finally {
        await cleanup();
      }
    });

    it('returns same result as sync version', async () => {
      await createTestFile('{"name": "compare", "nested": {"value": 42}}');
      try {
        const syncResult = getFileContent(testFile);
        const asyncResult = await getFileContentAsync(testFile);
        assert.deepEqual(syncResult, asyncResult);
      } finally {
        await cleanup();
      }
    });
  });
});
