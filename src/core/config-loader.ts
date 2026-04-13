/**
 * Core configuration loading logic shared between Zod v3 and v4 implementations.
 * This module is version-agnostic and uses a ZodAdapter for version-specific operations.
 */

import merge from 'lodash.merge';

import { getPaths } from '../utils/getPaths.js';
import { getFileContent, getFileContentAsync } from '../utils/getFileContent.js';
import { applyEnvVars, createLogger, validateConfig, validateDelimiter } from './env-loader.js';
import { DEFAULT_ENV_DELIMITER, type BaseGetConfigOptions, type ZodAdapter } from './types.js';

/**
 * Core implementation of getConfig that works with any Zod version.
 *
 * @param options - Configuration options
 * @param schema - The Zod schema
 * @param adapter - The Zod adapter for version-specific operations
 * @returns Validated configuration object
 */
export const getConfigCore = <T>(options: BaseGetConfigOptions, schema: unknown, adapter: ZodAdapter): T => {
  const { configPath, secretsPath, env, debug = false, delimiter = DEFAULT_ENV_DELIMITER } = options;
  validateDelimiter(delimiter);
  const log = createLogger(debug);

  const config: Record<string, unknown> = {};
  const filePaths = [...getPaths({ type: 'config', path: configPath, env }), ...getPaths({ type: 'secrets', path: secretsPath, env })];

  for (const path of filePaths) {
    log(`Loading config from: ${path}`);
    merge(config, getFileContent(path));
  }

  applyEnvVars(config, schema, adapter, log, delimiter);

  return validateConfig<T>(schema, config, adapter, log, debug);
};

/**
 * Core implementation of getConfigAsync that works with any Zod version.
 * Loads configuration files asynchronously.
 *
 * @param options - Configuration options
 * @param schema - The Zod schema
 * @param adapter - The Zod adapter for version-specific operations
 * @returns Promise resolving to validated configuration object
 */
export const getConfigAsyncCore = async <T>(options: BaseGetConfigOptions, schema: unknown, adapter: ZodAdapter): Promise<T> => {
  const { configPath, secretsPath, env, debug = false, delimiter = DEFAULT_ENV_DELIMITER } = options;
  validateDelimiter(delimiter);
  const log = createLogger(debug);

  const config: Record<string, unknown> = {};
  const filePaths = [...getPaths({ type: 'config', path: configPath, env }), ...getPaths({ type: 'secrets', path: secretsPath, env })];

  // Load all files in parallel for better performance
  const fileContents = await Promise.all(
    filePaths.map(async (path) => {
      log(`Loading config from: ${path}`);
      try {
        return await getFileContentAsync(path);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        throw new Error(`Failed to load config from "${path}": ${error.message}`, { cause: e });
      }
    })
  );

  // Merge all file contents in order
  for (const content of fileContents) {
    merge(config, content);
  }

  applyEnvVars(config, schema, adapter, log, delimiter);

  return validateConfig<T>(schema, config, adapter, log, debug);
};
