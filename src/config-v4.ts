import { z, ZodObject } from 'zod';

import { getConfigCore, getConfigAsyncCore } from './core/config-loader.js';
import { zodV4Adapter } from './core/zod-v4-adapter.js';
import type { BaseGetConfigOptions } from './core/types.js';

/** Options for getConfig function */
export interface GetConfigOptions<S extends ZodObject> extends BaseGetConfigOptions {
  /** Zod schema used to validate the configuration */
  schema: S;
}

/**
 * Loads and validates configuration from JSON files and environment variables.
 *
 * Configuration is loaded in the following order (later sources override earlier):
 * 1. Config files (configPath or default 'config/config.json')
 * 2. Secrets files (secretsPath or default 'secrets/secrets.json')
 * 3. Environment variables (using delimiter for nested paths, defaults to '___')
 *
 * @param options - Configuration options
 * @returns Validated and typed configuration object
 * @throws ZodError if configuration doesn't match the schema
 * @throws Error if config files exist but contain invalid JSON
 *
 * @example
 * const schema = z.object({
 *   PORT: z.number().default(3000),
 *   DATABASE_URL: z.string().url(),
 * });
 *
 * const config = getConfig({ schema });
 * console.log(config.PORT); // Type-safe access
 *
 * @example
 * // With debug mode
 * const config = getConfig({ schema, debug: true });
 * // Logs: [zonv] Loading config from: config/config.json
 * // Logs: [zonv] Applied env var: PORT = 8080
 *
 * @example
 * // With custom delimiter
 * const config = getConfig({ schema, delimiter: '__' });
 * // Now uses 'server__port' instead of 'server___port' for nested paths
 */
export const getConfig = <S extends ZodObject>({ schema, configPath, secretsPath, env, debug = false, delimiter }: GetConfigOptions<S>): z.infer<S> => {
  return getConfigCore<z.infer<S>>({ configPath, secretsPath, env, debug, delimiter }, schema, zodV4Adapter);
};

/**
 * Loads and validates configuration from JSON files and environment variables asynchronously.
 *
 * This is the async version of getConfig. It loads files in parallel for better performance.
 *
 * Configuration is loaded in the following order (later sources override earlier):
 * 1. Config files (configPath or default 'config/config.json')
 * 2. Secrets files (secretsPath or default 'secrets/secrets.json')
 * 3. Environment variables (using delimiter for nested paths, defaults to '___')
 *
 * @param options - Configuration options
 * @returns Promise resolving to validated and typed configuration object
 * @throws ZodError if configuration doesn't match the schema
 * @throws Error if config files exist but contain invalid JSON
 *
 * @example
 * const schema = z.object({
 *   PORT: z.number().default(3000),
 *   DATABASE_URL: z.string().url(),
 * });
 *
 * const config = await getConfigAsync({ schema });
 * console.log(config.PORT); // Type-safe access
 */
export const getConfigAsync = async <S extends ZodObject>({ schema, configPath, secretsPath, env, debug = false, delimiter }: GetConfigOptions<S>): Promise<z.infer<S>> => {
  return getConfigAsyncCore<z.infer<S>>({ configPath, secretsPath, env, debug, delimiter }, schema, zodV4Adapter);
};
