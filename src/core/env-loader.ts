import { dset } from 'dset';

import { get } from '../utils/get.js';
import { unwrapZodType } from '../utils/unwrapZodType.js';
import { DEFAULT_ENV_DELIMITER, type BaseGetConfigFromEnvOptions, type EnvSource, type ZodAdapter } from './types.js';

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
 * Formats an environment source value for debug logging.
 *
 * @param value - Value to format
 * @returns String representation safe for logging
 */
const formatEnvValueForLog = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * Returns whether the provided env-like value should be applied.
 *
 * Empty strings from `process.env` are ignored for backward compatibility,
 * but custom `envSources` may intentionally use `''` as an override.
 *
 * @param value - Raw env-like value
 * @param envSource - Source the value came from
 * @returns True when the value should be applied
 */
const hasEnvValue = (value: unknown, envSource: EnvSource): boolean => {
  return value !== undefined && (value !== '' || envSource !== process.env);
};

/**
 * Parses an env-like value according to the schema property type.
 * Strings are parsed as JSON for object/array schema fields; non-strings are used directly.
 *
 * @param value - Raw env-like value
 * @param schemaProp - The schema property for the path being resolved
 * @param adapter - The Zod adapter for version-specific operations
 * @returns Parsed value ready to be applied to the config object
 */
const parseEnvValue = (value: unknown, schemaProp: unknown, adapter: ZodAdapter): unknown => {
  const unwrapped = unwrapZodType(schemaProp);

  if (typeof value === 'string' && (adapter.isZodObject(unwrapped) || adapter.isZodArray(unwrapped))) {
    return JSON.parse(value);
  }

  return value;
};

/**
 * Applies environment variables to the config object based on schema paths.
 *
 * @param config - The config object to modify
 * @param schema - The Zod schema
 * @param adapter - The Zod adapter for version-specific operations
 * @param log - Logger function
 * @param delimiter - The delimiter used for nested paths in env var names
 * @param envSources - Ordered env-like sources to apply
 */
export const applyEnvVars = (
  config: Record<string, unknown>,
  schema: unknown,
  adapter: ZodAdapter,
  log: (message: string) => void,
  delimiter: string,
  envSources: readonly EnvSource[]
): void => {
  const propertiesPaths = adapter.getPropertiesPathsFromSchema(schema);
  const schemaShape = adapter.getSchemaShape(schema);

  for (const [sourceIndex, envSource] of envSources.entries()) {
    for (const path of propertiesPaths) {
      const envKey = path.split('.').join(delimiter);
      const envValue = envSource[envKey];

      // Keep ignoring empty strings from process.env for backward compatibility,
      // but allow custom envSources to intentionally override with ''.
      if (hasEnvValue(envValue, envSource)) {
        try {
          const schemaProp = get(schemaShape, path);
          const parsedValue = parseEnvValue(envValue, schemaProp, adapter);
          dset(config, path, parsedValue);

          const envValueForLog = truncateForLog(formatEnvValueForLog(envValue));
          const logPrefix = envSources.length === 1 ? 'Applied env var' : `Applied envSources[${sourceIndex}]`;
          log(`${logPrefix}: ${envKey} = ${envValueForLog}`);
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          throw new Error(`Failed to parse environment variable "${envKey}": ${error.message}`, { cause: e });
        }
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
  const { debug = false, envSources = [process.env], delimiter = DEFAULT_ENV_DELIMITER } = options;
  validateDelimiter(delimiter);
  const log = createLogger(debug);

  const config: Record<string, unknown> = {};

  applyEnvVars(config, schema, adapter, log, delimiter, envSources);

  return validateConfig<T>(schema, config, adapter, log, debug);
};
