/** Maximum recursion depth for unwrapping nested Zod types */
const MAX_UNWRAP_DEPTH = 100;

/**
 * Unwraps Zod wrapper types (optional, nullable, default, catch, etc.) to get the inner type.
 *
 * Zod allows chaining modifiers like `.optional().nullable().default()`.
 * This function recursively unwraps these modifiers to find the core type.
 *
 * Includes a depth limit to prevent stack overflow from malformed schemas.
 *
 * @param schema - A Zod schema that may be wrapped
 * @param depth - Current recursion depth (internal use)
 * @returns The innermost unwrapped Zod type
 *
 * @example
 * const schema = z.object({ x: z.number() }).optional().nullable();
 * unwrapZodType(schema); // Returns the ZodObject
 *
 * @example
 * // Deeply chained modifiers
 * const schema = z.object({ x: z.number() }).optional().nullable().default({ x: 0 });
 * unwrapZodType(schema); // Returns the ZodObject
 */
export const unwrapZodType = (schema: unknown, depth: number = 0): unknown => {
  // Prevent infinite recursion from malformed schemas
  if (depth >= MAX_UNWRAP_DEPTH) {
    return schema;
  }

  // Check if schema has _def with innerType (wrapper types like ZodOptional, ZodNullable, ZodDefault, ZodCatch)
  const def = (schema as { _def?: { innerType?: unknown } })?._def;
  if (def && 'innerType' in def && def.innerType !== undefined) {
    return unwrapZodType(def.innerType, depth + 1);
  }
  return schema;
};
