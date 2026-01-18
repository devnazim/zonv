/**
 * Keys that could be used for prototype pollution attacks.
 * These are blocked from being merged into config objects.
 */
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Recursively sanitizes an object by removing keys that could cause prototype pollution.
 *
 * This function removes dangerous keys like `__proto__`, `constructor`, and `prototype`
 * from objects to prevent prototype pollution attacks when merging untrusted JSON data.
 *
 * @param obj - The object to sanitize
 * @returns A new object with dangerous keys removed
 *
 * @example
 * const malicious = { "__proto__": { "polluted": true }, "safe": "value" };
 * sanitizeObject(malicious); // { "safe": "value" }
 *
 * @example
 * const nested = { "config": { "__proto__": { "bad": true }, "port": 3000 } };
 * sanitizeObject(nested); // { "config": { "port": 3000 } }
 */
export const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip dangerous keys
    if (DANGEROUS_KEYS.includes(key)) {
      continue;
    }

    // Recursively sanitize nested objects (but not arrays)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
