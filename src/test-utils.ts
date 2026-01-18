import { writeFile, unlink, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, sep } from 'node:path';

/**
 * Configuration file definition for test setup.
 */
export interface TestConfigFile {
  /** Path to the config file */
  path: string;
  /** Data to write to the file */
  data: Record<string, unknown>;
}

/**
 * Result of creating test config files.
 */
export interface TestConfigResult {
  /** Function to clean up created files and directories */
  cleanup: () => Promise<void>;
}

/**
 * Creates temporary configuration files for testing.
 *
 * This utility creates the necessary directory structure and writes JSON files
 * for testing configuration loading. It returns a cleanup function that removes
 * all created files and directories.
 *
 * @param files - Array of file definitions to create
 * @returns Object with cleanup function
 *
 * @example
 * const { cleanup } = await createConfigFiles([
 *   { path: './tmp/config.json', data: { port: 3000 } }
 * ]);
 * try {
 *   // Run tests
 * } finally {
 *   await cleanup();
 * }
 */
export const createConfigFiles = async (files: TestConfigFile[]): Promise<TestConfigResult> => {
  const dirToDelete: string[] = [];

  for (const file of files) {
    const dir = dirname(file.path);
    const paths = dir.split(sep);
    const nestedPaths: string[] = [];
    let currentPath: string[] = [];

    for (const path of paths) {
      currentPath.push(path);
      const currentDir = currentPath.join(sep);
      if (existsSync(currentDir) === false) {
        nestedPaths.push(currentDir);
        await mkdir(currentDir);
      }
    }

    dirToDelete.push(...nestedPaths.reverse());
    await writeFile(file.path, JSON.stringify(file.data, null, 2));
  }

  return {
    cleanup: async () => {
      for (const file of files) {
        if (existsSync(file.path)) {
          await unlink(file.path);
        }
      }
      for (const dir of dirToDelete) {
        if (existsSync(dir)) {
          await rm(dir, { recursive: true });
        }
      }
    },
  };
};
