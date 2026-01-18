/**
 * Zod v3 adapter for the core configuration loader.
 * Provides version-specific operations for Zod v3.
 */

import { z, ZodObject, ZodArray, SomeZodObject } from 'zod/v3';
import { unwrapZodType } from '../utils/unwrapZodType.js';
import type { ZodAdapter } from './types.js';

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
  const getPaths = (obj: SomeZodObject, prefix: string[] = []) => {
    let keys: string[] = [];
    try {
      // NOTE: for some environments using serialization, instanceof check will not work.
      // We use try-catch to safely attempt extracting keys from the schema.
      keys = Object.keys(obj.keyof().Values) as string[];
    } catch {
      // Schema doesn't support keyof() - skip silently as this is expected for some types
    }
    for (const key of keys) {
      paths.push([...prefix, key].join('.'));
      // Unwrap the type to check if it's a ZodObject (handles optional, nullable, default, etc.)
      const unwrapped = unwrapZodType(obj.shape[key]);
      if (unwrapped instanceof ZodObject) {
        getPaths(unwrapped as SomeZodObject, [...prefix, key]);
      }
    }
  };
  getPaths(schema as SomeZodObject);
  return paths;
};

/**
 * Zod v3 adapter implementation.
 * Provides all version-specific operations needed by the core loader.
 */
export const zodV3Adapter: ZodAdapter = {
  isZodObject: (value: unknown): boolean => value instanceof ZodObject,

  isZodArray: (value: unknown): boolean => value instanceof ZodArray,

  isZodError: (value: unknown): boolean => value instanceof z.ZodError,

  getZodErrorIssues: (error: unknown): Array<{ path: (string | number)[]; message: string }> => {
    if (error instanceof z.ZodError) {
      return error.issues;
    }
    return [];
  },

  parseSchema: (schema: unknown, config: Record<string, unknown>): unknown => {
    return (schema as SomeZodObject).parse(config);
  },

  getPropertiesPathsFromSchema,

  getSchemaShape: (schema: unknown): Record<string, unknown> => {
    return (schema as SomeZodObject).shape;
  },
};
