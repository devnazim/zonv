/**
 * Shared types for zonv configuration loading.
 * These types are version-agnostic and work with both Zod v3 and v4.
 */

/** Default delimiter for environment variable nested paths */
export const DEFAULT_ENV_DELIMITER = '___';

/** Base options for getConfig function (version-agnostic) */
export interface BaseGetConfigOptions {
  /** Path(s) to config JSON file(s). Defaults to 'config/config.json' */
  configPath?: string | string[];
  /** Path(s) to secrets JSON file(s). Defaults to 'secrets/secrets.json' */
  secretsPath?: string | string[];
  /** Environment name used to load environment-specific config (e.g., 'production' loads 'production.config.json') */
  env?: string;
  /** Enable debug logging to see which files and env vars are being loaded */
  debug?: boolean;
  /**
   * Delimiter used to separate nested paths in environment variable names.
   * Defaults to '___' (triple underscore).
   * For example, with delimiter '___', the env var 'server___port' maps to { server: { port: ... } }
   * With delimiter '__', the env var 'server__port' maps to { server: { port: ... } }
   *
   * @remarks
   * - Cannot be an empty string (will throw an error)
   * - Avoid using '.' as it may conflict with internal path notation
   * - Single-character delimiters may cause unintended matches with system env vars
   */
  delimiter?: string;
}

/** Base options for getConfigFromEnv function (version-agnostic) */
export interface BaseGetConfigFromEnvOptions {
  /** Enable debug logging to see which env vars are being loaded */
  debug?: boolean;
  /**
   * Delimiter used to separate nested paths in environment variable names.
   * Defaults to '___' (triple underscore).
   * For example, with delimiter '___', the env var 'server___port' maps to { server: { port: ... } }
   * With delimiter '__', the env var 'server__port' maps to { server: { port: ... } }
   *
   * @remarks
   * - Cannot be an empty string (will throw an error)
   * - Avoid using '.' as it may conflict with internal path notation
   * - Single-character delimiters may cause unintended matches with system env vars
   */
  delimiter?: string;
}

/**
 * Zod adapter interface for version-specific operations.
 * This allows the core logic to work with both Zod v3 and v4.
 */
export interface ZodAdapter {
  /** Check if a value is a ZodObject instance */
  isZodObject: (value: unknown) => boolean;
  /** Check if a value is a ZodArray instance */
  isZodArray: (value: unknown) => boolean;
  /** Check if an error is a ZodError instance */
  isZodError: (value: unknown) => boolean;
  /** Get issues from a ZodError */
  getZodErrorIssues: (error: unknown) => Array<{ path: (string | number)[]; message: string }>;
  /** Parse config with schema and return validated result */
  parseSchema: (schema: unknown, config: Record<string, unknown>) => unknown;
  /** Get property paths from a schema */
  getPropertiesPathsFromSchema: (schema: unknown) => string[];
  /** Get the shape object from a schema */
  getSchemaShape: (schema: unknown) => Record<string, unknown>;
}
