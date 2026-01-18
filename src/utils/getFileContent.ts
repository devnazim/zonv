import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { sanitizeObject } from './sanitizeObject.js';

/**
 * Parses and validates JSON content from a string.
 * Shared logic between sync and async file reading.
 *
 * @param fileContent - The raw file content string
 * @param path - Path to the file (for error messages)
 * @returns Parsed and sanitized JSON content as an object
 * @throws Error if content is invalid JSON or not a plain object
 */
const parseAndValidateContent = (fileContent: string, path: string): Record<string, unknown> => {
  // Empty or whitespace-only files are treated as empty config
  if (!fileContent || fileContent.trim() === '') {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    throw new Error(`Failed to parse JSON in config file "${path}": ${error.message}`);
  }

  // Validate that the parsed content is a plain object (not array, null, or primitive)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    const actualType = parsed === null ? 'null' : Array.isArray(parsed) ? 'array' : typeof parsed;
    throw new Error(`Config file "${path}" must contain a JSON object, but got ${actualType}`);
  }

  // Sanitize to prevent prototype pollution attacks
  return sanitizeObject(parsed as Record<string, unknown>);
};

/**
 * Reads and parses a JSON configuration file synchronously.
 *
 * The parsed content is sanitized to prevent prototype pollution attacks
 * by removing dangerous keys like `__proto__`, `constructor`, and `prototype`.
 *
 * @param path - Path to the JSON file
 * @returns Parsed and sanitized JSON content as an object, or empty object if file doesn't exist
 * @throws Error if file exists but contains invalid JSON
 * @throws Error if file exists but cannot be read (permission issues, etc.)
 *
 * @example
 * const config = getFileContent('./config/config.json');
 */
export const getFileContent = (path: string): Record<string, unknown> => {
  let fileContent: string | undefined;
  try {
    fileContent = readFileSync(path, { encoding: 'utf-8' });
  } catch (e) {
    // readFileSync throws error with Type NodeJS.ErrnoException
    const error = e as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      // File doesn't exist - return empty object (this is expected behavior)
      return {};
    }
    // Re-throw other errors (permission denied, etc.)
    throw new Error(`Failed to read config file "${path}": ${error.message}`);
  }

  return parseAndValidateContent(fileContent, path);
};

/**
 * Reads and parses a JSON configuration file asynchronously.
 *
 * The parsed content is sanitized to prevent prototype pollution attacks
 * by removing dangerous keys like `__proto__`, `constructor`, and `prototype`.
 *
 * @param path - Path to the JSON file
 * @returns Promise resolving to parsed and sanitized JSON content as an object, or empty object if file doesn't exist
 * @throws Error if file exists but contains invalid JSON
 * @throws Error if file exists but cannot be read (permission issues, etc.)
 *
 * @example
 * const config = await getFileContentAsync('./config/config.json');
 */
export const getFileContentAsync = async (path: string): Promise<Record<string, unknown>> => {
  let fileContent: string | undefined;
  try {
    fileContent = await readFile(path, { encoding: 'utf-8' });
  } catch (e) {
    // readFile throws error with Type NodeJS.ErrnoException
    const error = e as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      // File doesn't exist - return empty object (this is expected behavior)
      return {};
    }
    // Re-throw other errors (permission denied, etc.)
    throw new Error(`Failed to read config file "${path}": ${error.message}`);
  }

  return parseAndValidateContent(fileContent, path);
};
