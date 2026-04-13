import { dset } from 'dset';

import { get } from '../utils/get.js';
import { unwrapZodType } from '../utils/unwrapZodType.js';
import { DEFAULT_ENV_DELIMITER, type BaseGetConfigFromEnvOptions, type ZodAdapter } from './types.js';

/**
 * Validates the delimiter option.
 * @param delimiter - The delimiter to validate
 * @throws Error if delimiter is empty
 */
export const validateDelimiter = (delimiter: string): void => {
  if (delimiter === '') {
    throw new Error('Delimiter cannot be an empty string');
  }
};

/**
 * Creates a debug logger function.
 * @param debug - Whether debug mode is enabled
 * @returns Logger function that only logs when debug is true
 */
export const createLogger = (debug: boolean) => (message: string) => {
  if (debug) {
    // eslint-disable-next-line no-console
    console.log(`[zonv] ${message}`);
  }
};

/**
 * Truncates a string for display in logs.
 * @param value - The string to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated string with '...' suffix if needed
 */
const truncateForLog = (value: string, maxLength = 50): string => {
  return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
};

/**
 * Applies environment variables to the config object based on schema paths.
 *
 * @param config - The config object to modify
 * @param schema - The Zod schema
 * @param adapter - The Zod adapter for version-specific operations
 * @param log - Logger function
 * @param delimiter - The delimiter used for nested paths in env var names
 */
export const applyEnvVars = (config: Record<string, unknown>, schema: unknown, adapter: ZodAdapter, log: (message: string) => void, delimiter: string): void => {
  const propertiesPaths = adapter.getPropertiesPathsFromSchema(schema);
  const schemaShape = adapter.getSchemaShape(schema);

  for (const path of propertiesPaths) {
    const envKey = path.split('.').join(delimiter);
    const envValue = process.env[envKey];

    // Skip empty string values - they shouldn't override file config
    if (envValue !== undefined && envValue !== '') {
      try {
        const schemaProp = get(schemaShape, path);
        // Unwrap the type to check if it's a ZodObject/ZodArray (handles optional, nullable, default, etc.)
        const unwrapped = unwrapZodType(schemaProp);
        const parsedValue = adapter.isZodObject(unwrapped) || adapter.isZodArray(unwrapped) ? JSON.parse(envValue) : envValue;
        dset(config, path, parsedValue);
        log(`Applied env var: ${envKey} = ${truncateForLog(envValue)}`);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        throw new Error(`Failed to parse environment variable "${envKey}": ${error.message}`, { cause: e });
      }
    }
  }
};

/**
 * Validates config against schema and handles debug logging for errors.
 *
 * @param schema - The Zod schema
 * @param config - The config object to validate
 * @param adapter - The Zod adapter for version-specific operations
 * @param log - Logger function
 * @param debug - Whether debug mode is enabled
 * @returns Validated config object
 */
export const validateConfig = <T>(schema: unknown, config: Record<string, unknown>, adapter: ZodAdapter, log: (message: string) => void, debug: boolean): T => {
  try {
    return adapter.parseSchema(schema, config) as T;
  } catch (e) {
    if (debug && adapter.isZodError(e)) {
      log('Validation failed with errors:');
      for (const issue of adapter.getZodErrorIssues(e)) {
        log(`  - ${issue.path.join('.')}: ${issue.message}`);
      }
    }
    throw e;
  }
};

/**
 * Core implementation of getConfigFromEnv that works with any Zod version.
 *
 * @param options - Configuration options
 * @param schema - The Zod schema
 * @param adapter - The Zod adapter for version-specific operations
 * @returns Validated configuration object
 */
export const getConfigFromEnvCore = <T>(options: BaseGetConfigFromEnvOptions, schema: unknown, adapter: ZodAdapter): T => {
  const { debug = false, delimiter = DEFAULT_ENV_DELIMITER } = options;
  validateDelimiter(delimiter);
  const log = createLogger(debug);

  const config: Record<string, unknown> = {};

  applyEnvVars(config, schema, adapter, log, delimiter);

  return validateConfig<T>(schema, config, adapter, log, debug);
};
