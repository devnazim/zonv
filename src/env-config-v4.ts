import { z, ZodObject } from 'zod';

import { getConfigFromEnvCore } from './core/env-loader.js';
import { zodV4Adapter } from './core/zod-v4-adapter.js';
import type { BaseGetConfigFromEnvOptions } from './core/types.js';

/** Options for getConfigFromEnv function */
export interface GetConfigFromEnvOptions<S extends ZodObject> extends BaseGetConfigFromEnvOptions {
  /** Zod schema used to validate the configuration */
  schema: S;
}

/**
 * Loads and validates configuration from environment-like sources only.
 * Useful when file-based config is not available (e.g., React Native, serverless).
 * Standard env sources such as process.env and .env files usually provide strings,
 * so use coercion or preprocessing for numbers and booleans.
 * Defaults to reading from [process.env], but custom `envSources` such as [import.meta.env]
 * may also provide direct typed values.
 * Empty strings from `process.env` are ignored for backward compatibility,
 * while custom `envSources` can intentionally provide `''`.
 *
 * Environment variables use the delimiter (defaults to '___') as the nested path separator.
 * For example, `server___port` maps to `{ server: { port: ... } }`.
 *
 * @param options - Configuration options
 * @returns Validated and typed configuration object
 * @throws ZodError if configuration doesn't match the schema
 * @throws Error if environment variable contains invalid JSON for object/array fields
 *
 * @example
 * import { z } from 'zod';
 * import { getConfigFromEnv } from 'zonv/env-config';
 *
 * const schema = z.object({
 *   PORT: z.coerce.number().default(3000),
 *   API_BASE_URL: z.string().url(),
 * });
 *
 * // Set env vars: PORT=8080, API_BASE_URL=https://api.example.com
 * const config = getConfigFromEnv({ schema });
 *
 * @example
 * // Nested config with env vars
 * import { z } from 'zod';
 * import { getConfigFromEnv } from 'zonv/env-config';
 *
 * const schema = z.object({
 *   server: z.object({ port: z.coerce.number(), host: z.string() })
 * });
 * // Set env vars: server___port=8080, server___host=localhost
 * const config = getConfigFromEnv({ schema });
 *
 * @example
 * // With custom delimiter
 * import { z } from 'zod';
 * import { getConfigFromEnv } from 'zonv/env-config';
 *
 * const schema = z.object({
 *   server: z.object({ port: z.coerce.number() })
 * });
 * const config = getConfigFromEnv({ schema, delimiter: '__' });
 * // Now uses 'server__port' instead of 'server___port'
 *
 * @example
 * // With Astro / Vite env sources
 * const config = getConfigFromEnv({ schema, envSources: [import.meta.env] });
 */
export const getConfigFromEnv = <S extends ZodObject>({ schema, debug = false, envSources, delimiter }: GetConfigFromEnvOptions<S>): z.infer<S> => {
  return getConfigFromEnvCore<z.infer<S>>({ debug, envSources, delimiter }, schema, zodV4Adapter);
};
