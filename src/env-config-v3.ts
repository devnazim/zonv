import { z, SomeZodObject } from 'zod/v3';

import { getConfigFromEnvCore } from './core/config-loader.js';
import { zodV3Adapter } from './core/zod-v3-adapter.js';
import type { BaseGetConfigFromEnvOptions } from './core/types.js';

/** Options for getConfigFromEnv function */
export interface GetConfigFromEnvOptions<S extends SomeZodObject> extends BaseGetConfigFromEnvOptions {
  /** Zod schema used to validate the configuration */
  schema: S;
}

/**
 * Loads and validates configuration from environment variables only.
 * Useful when file-based config is not available (e.g., React Native, serverless).
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
 * const schema = z.object({
 *   PORT: z.number().default(3000),
 *   API_BASE_URL: z.string().url(),
 * });
 *
 * // Set env vars: PORT=8080, API_BASE_URL=https://api.example.com
 * const config = getConfigFromEnv({ schema });
 *
 * @example
 * // Nested config with env vars
 * const schema = z.object({
 *   server: z.object({ port: z.number(), host: z.string() })
 * });
 * // Set env vars: server___port=8080, server___host=localhost
 * const config = getConfigFromEnv({ schema });
 *
 * @example
 * // With custom delimiter
 * const config = getConfigFromEnv({ schema, delimiter: '__' });
 * // Now uses 'server__port' instead of 'server___port'
 */
export const getConfigFromEnv = <S extends SomeZodObject>({ schema, debug = false, delimiter }: GetConfigFromEnvOptions<S>): z.infer<S> => {
  return getConfigFromEnvCore<z.infer<S>>({ debug, delimiter }, schema, zodV3Adapter);
};
