/**
 * Zod v3 adapter for the core configuration loader.
 * Provides version-specific operations for Zod v3.
 */

import { unwrapZodType } from '../utils/unwrapZodType.js';
import type { ZodV3ObjectLike } from './zod-v3-types.js';
import type { ZodAdapter } from './types.js';

const getTypeName = (value: unknown): string | undefined => {
  return (value as { _def?: { typeName?: string } })?._def?.typeName;
};

const isZodObjectLike = (value: unknown): value is ZodV3ObjectLike => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { parse?: unknown }).parse === 'function' &&
    typeof (value as { shape?: unknown }).shape === 'object' &&
    (typeof (value as { keyof?: unknown }).keyof === 'function' || getTypeName(value) === 'ZodObject')
  );
};

const isZodErrorLike = (value: unknown): value is { issues: Array<{ path: unknown[]; message: string }> } => {
  return value instanceof Error && value.name === 'ZodError' && Array.isArray((value as { issues?: unknown }).issues);
};

/**
 * Extracts all property paths from a Zod v3 schema object.
 * Returns an array of dot-notation paths for all schema properties.
 * Handles wrapped types like optional(), nullable(), and default().
 *
 * @param schema - A Zod v3 object schema
 * @returns Array of property paths (e.g., ['name', 'server.port', 'server.host'])
 */
const getPropertiesPathsFromSchema = (schema: unknown): string[] => {
  const paths: string[] = [];
  const getPaths = (obj: ZodV3ObjectLike, prefix: string[] = []) => {
    let keys: string[] = [];
    try {
      // NOTE: for some environments using serialization, instanceof check will not work.
      // We use try-catch to safely attempt extracting keys from the schema.
      keys = Object.keys(obj.keyof?.().Values ?? {}) as string[];
    } catch {
      // Schema doesn't support keyof() - skip silently as this is expected for some types
    }
    for (const key of keys) {
      paths.push([...prefix, key].join('.'));
      // Unwrap the type to check if it's a ZodObject (handles optional, nullable, default, etc.)
      const unwrapped = unwrapZodType(obj.shape[key]);
      if (isZodObjectLike(unwrapped)) {
        getPaths(unwrapped, [...prefix, key]);
      }
    }
  };
  getPaths(schema as ZodV3ObjectLike);
  return paths;
};

/**
 * Zod v3 adapter implementation.
 * Provides all version-specific operations needed by the core loader.
 */
export const zodV3Adapter: ZodAdapter = {
  isZodObject: (value: unknown): boolean => isZodObjectLike(value),

  isZodArray: (value: unknown): boolean => getTypeName(value) === 'ZodArray',

  isZodError: (value: unknown): boolean => isZodErrorLike(value),

  getZodErrorIssues: (error: unknown): Array<{ path: (string | number)[]; message: string }> => {
    if (isZodErrorLike(error)) {
      return error.issues.map((issue) => ({
        path: issue.path.filter((value): value is string | number => typeof value === 'string' || typeof value === 'number'),
        message: issue.message,
      }));
    }
    return [];
  },

  parseSchema: (schema: unknown, config: Record<string, unknown>): unknown => {
    return (schema as ZodV3ObjectLike).parse(config);
  },

  getPropertiesPathsFromSchema,

  getSchemaShape: (schema: unknown): Record<string, unknown> => {
    return (schema as ZodV3ObjectLike).shape;
  },
};
