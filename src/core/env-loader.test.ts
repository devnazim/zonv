import assert from 'node:assert';
import { it } from 'node:test';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod';

import { getConfigFromEnvCore } from './env-loader.js';
import { zodV3Adapter } from './zod-v3-adapter.js';
import { zodV4Adapter } from './zod-v4-adapter.js';

for (const { version, schema, adapter } of [
  {
    version: 3,
    schema: z3.object({ value: z3.string(), empty: z3.string(), optional: z3.string().optional() }),
    adapter: zodV3Adapter,
  },
  {
    version: 4,
    schema: z4.object({ value: z4.string(), empty: z4.string(), optional: z4.string().optional() }),
    adapter: zodV4Adapter,
  },
]) {
  it(`uses custom envSources without process with Zod v${version}`, { concurrency: false }, () => {
    const originalProcess = globalThis.process;
    let config: unknown;

    try {
      Reflect.deleteProperty(globalThis, 'process');
      config = getConfigFromEnvCore(
        { envSources: [{ value: 'first' }, { value: 'second', empty: '', optional: undefined }] },
        schema,
        adapter
      );
    } finally {
      globalThis.process = originalProcess;
    }

    assert.deepEqual(config, { value: 'second', empty: '', optional: undefined });
  });
}
