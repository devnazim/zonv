/**
 * Gets a nested property value from an object using dot notation.
 *
 * @param obj - The object to get the value from
 * @param path - Dot-separated path string or array of path segments
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * get({ a: { b: { c: 1 } } }, 'a.b.c'); // 1
 * get({ a: { b: { c: 1 } } }, ['a', 'b', 'c']); // 1
 * get({ a: 1 }, 'b.c'); // undefined
 */
export const get = (obj: unknown, path: string | string[]): unknown => {
  if (typeof obj !== 'object' || obj === null || !path) {
    return undefined;
  }
  let currValue: unknown = obj;
  const paths = Array.isArray(path) ? path : path.split('.');
  for (const prop of paths) {
    if (currValue === null || currValue === undefined) {
      return undefined;
    }
    currValue = (currValue as Record<string, unknown>)[prop];
  }
  return currValue;
};
