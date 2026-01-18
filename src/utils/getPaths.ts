import { resolve } from 'node:path';
import { cwd } from 'node:process';

/**
 * Splits a comma or whitespace-separated string into an array of paths.
 */
const buildArrayFromString = (str: string): string[] => {
  const regex = /\s+|,\s*/gm;
  return str.split(regex);
};

/** Options for getPaths function */
export interface GetPathsOptions {
  /** Type of config file - determines default directory */
  type: 'config' | 'secrets';
  /** Path(s) to config files - can be a single path, array, or comma-separated string */
  path?: string[] | string;
  /** Environment name prefix for config files */
  env?: string;
}

/**
 * Resolves configuration file paths based on provided options.
 *
 * If no path is provided, returns the default path:
 * - For config: `config/{env.}config.json`
 * - For secrets: `secrets/{env.}secrets.json`
 *
 * @param options - Path resolution options
 * @returns Array of resolved file paths
 *
 * @example
 * getPaths({ type: 'config' }); // ['<cwd>/config/config.json']
 * getPaths({ type: 'config', env: 'prod' }); // ['<cwd>/config/prod.config.json']
 * getPaths({ type: 'config', path: '/custom/path.json' }); // ['/custom/path.json']
 * getPaths({ type: 'config', path: 'a.json, b.json' }); // ['a.json', 'b.json']
 */
export const getPaths = ({ type, path, env }: GetPathsOptions): string[] => {
  const pathArr: string[] = [];
  if (Array.isArray(path) && path.length) {
    pathArr.push(...path);
  } else if (typeof path === 'string' && path.length) {
    pathArr.push(...buildArrayFromString(path));
  } else {
    pathArr.push(resolve(cwd(), `./${type}/${env ? `${env}.` : ''}${type}.json`));
  }
  return pathArr.filter((p) => p.trim().length > 0);
};
