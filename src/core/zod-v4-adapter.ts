/**
 * Zod v4 adapter for the core configuration loader.
 * Provides version-specific operations for Zod v4.
 */

import { z, ZodObject, ZodArray } from 'zod';
import { unwrapZodType } from '../utils/unwrapZodType.js';
import type { ZodAdapter } from './types.js';

/**
 * Extracts all property paths from a Zod v4 schema object.
 * Returns an array of dot-notation paths for all schema properties.
 * Handles wrapped types like optional(), nullable(), and default().
 *
 * @param schema - A Zod v4 object schema
 * @returns Array of property paths (e.g., ['name', 'server.port', 'server.host'])
 */
const getPropertiesPathsFromSchema = (schema: unknown): string[] => {
  const paths: string[] = [];
  const getPaths = (obj: ZodObject, prefix: string[] = []) => {
    const keys = obj instanceof ZodObject ? obj.keyof().options : [];
    for (const key of keys) {
      paths.push([...prefix, key].join('.'));
      // Unwrap the type to check if it's a ZodObject (handles optional, nullable, default, etc.)
      const unwrapped = unwrapZodType(obj.shape[key]);
      if (unwrapped instanceof ZodObject) {
        getPaths(unwrapped, [...prefix, key]);
      }
    }
  };
  getPaths(schema as ZodObject);
  return paths;
};

/**
 * Zod v4 adapter implementation.
 * Provides all version-specific operations needed by the core loader.
 */
export const zodV4Adapter: ZodAdapter = {
  isZodObject: (value: unknown): boolean => value instanceof ZodObject,

  isZodArray: (value: unknown): boolean => value instanceof ZodArray,

  isZodError: (value: unknown): boolean => value instanceof z.ZodError,

  getZodErrorIssues: (error: unknown): Array<{ path: (string | number)[]; message: string }> => {
    if (error instanceof z.ZodError) {
      // Map issues to ensure path elements are string | number (filter out symbols)
      return error.issues.map((issue) => ({
        path: issue.path.filter((p): p is string | number => typeof p === 'string' || typeof p === 'number'),
        message: issue.message,
      }));
    }
    return [];
  },

  parseSchema: (schema: unknown, config: Record<string, unknown>): unknown => {
    return (schema as ZodObject).parse(config);
  },

  getPropertiesPathsFromSchema,

  getSchemaShape: (schema: unknown): Record<string, unknown> => {
    return (schema as ZodObject).shape;
  },
};
