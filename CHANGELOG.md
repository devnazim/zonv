# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.3] - 2026-04-13

### Added

- `npm run lint` script for the ESLint flat config
- README guidance for importing validated config via a TypeScript path alias, including the matching runtime or bundler alias requirement

### Changed

- Updated dev dependencies to latest versions:
  - `@eslint/js`: 9.39.2 -> 10.0.1
  - `@types/node`: 24.10.10 -> 25.6.0
  - `eslint`: 9.39.2 -> 10.2.0
  - `eslint-config-prettier`: 10.0.1 -> 10.1.8
  - `globals`: 17.3.0 -> 17.5.0
  - `prettier`: 3.8.1 -> 3.8.2
  - `typescript`: 5.9.3 -> 6.0.2
  - `typescript-eslint`: 8.54.0 -> 8.58.1
- Updated TypeScript build configuration for TS6 by setting `rootDir` explicitly and preserving the existing CommonJS output
- Clarified custom delimiter documentation to note that any non-empty delimiter is supported
- Preserved original error causes when rethrowing config parsing and loading errors
- Release validation now runs `npm run lint` before test and build steps

### Fixed

- Fixed `zonv/v3` to work with real `zod@3` installs without requiring the `zod/v3` subpath at runtime
- Fixed `zonv/env-config` bundling for Next.js and other client-bundled env-only usage by separating env-only loading from file-based config loading

### Security

- Applied `npm audit fix` to resolve a transitive vulnerability in `flatted`

### Notes for Maintainers

- Dev tooling now follows upstream Node requirements from ESLint 10 and related tooling; package runtime support remains `node >=18.0.0`
- `tsconfig.cjs.json` temporarily uses `ignoreDeprecations: "6.0"` while the CommonJS build still relies on deprecated TS6 compiler options; revisit this before TS7

## [2.2.2] - 2026-02-03

### Added

- Integration tests for Zod 4.3.x features (`z.looseRecord`, `z.xor`, `.exactOptional()`, `.slugify()`)
- Tested Zod versions documentation in README

### Changed

- Updated dev dependencies to latest versions:
  - `@types/node`: 24.10.9 → 24.10.10
  - `globals`: 17.0.0 → 17.3.0
  - `prettier`: 3.8.0 → 3.8.1
  - `typescript-eslint`: 8.53.0 → 8.54.0
- Updated `zod` peer dependency tested version: 4.1.5 → 4.3.6
- Improved TypeScript configuration with explicit `lib` and `types` options

### Notes for Users

- **Zod 4.3.x Breaking Changes**: If you update Zod alongside zonv, be aware of the following changes in Zod 4.3.x that may affect your code:
  - `.pick()` and `.omit()` now throw on schemas with refinements (previously silently dropped refinements)
  - `.extend()` throws when overwriting properties on schemas with refinements
  - `.pick()` and `.omit()` now validate that keys exist in the schema

  These changes do not affect zonv's internal functionality, but may affect your schema definitions if you use these methods on refined schemas.

## [2.2.0] - 2026-01-16

### Added

- **Async API**: New `getConfigAsync()` function that loads config files asynchronously using `fs/promises`
  - Loads multiple files in parallel for better performance
  - Same API as `getConfig()` but returns a Promise
- **Custom delimiter option**: New `delimiter` option to customize the nested path separator in env vars
  - Defaults to `___` (triple underscore) for backward compatibility
  - Example: `{ delimiter: '__' }` uses `server__port` instead of `server___port`
- Debug mode (`debug: boolean` option) for troubleshooting configuration loading
- Support for wrapped Zod types (`.optional()`, `.nullable()`, `.default()`, `.catch()`)
- Comprehensive JSDoc documentation for all public APIs
- Unit tests for edge cases (132 total tests, up from 37)
- Protection against prototype pollution attacks
- Validation that config files contain JSON objects (not arrays or primitives)
- Graceful handling of whitespace-only config files
- `CHANGELOG.md` file
- `LICENSE` file (MIT)

### Changed

- **Internal refactoring**: Extracted shared logic between v3 and v4 into a core module
  - Reduced code duplication significantly
  - Uses adapter pattern for Zod version-specific operations
- License changed from BSD-2-Clause to MIT for broader public use
- Empty string environment variables no longer override file config values
- Improved error messages with file paths and context
- Updated all dependencies to latest versions

### Fixed

- Fixed `package.json` exports typo (`dist/cls` → `dist/cjs`)
- Fixed parameter naming in README (`configPaths` → `configPath`)
- Fixed various typos in documentation
- Fixed Zod v3 error property access (`.errors` → `.issues`)
- Fixed ESLint configuration syntax error

### Security

- Added sanitization to prevent prototype pollution via `__proto__`, `constructor`, `prototype` keys
- Added depth limit to recursive type unwrapping to prevent stack overflow

## [2.1.3] - 2024-12-01

### Fixed

- Fixed CJS build output

## [2.1.2] - 2024-11-15

### Fixed

- Fixed CJS module exports

## [2.1.1] - 2024-11-10

### Added

- Added CommonJS (CJS) build support alongside ESM

### Changed

- Updated build configuration for dual ESM/CJS output

## [2.1.0] - 2024-10-20

### Changed

- Updated dependencies

## [2.0.0] - 2024-09-15

### Added

- Support for Zod v4 (default export)
- Explicit `zonv/v3` and `zonv/v4` import paths
- `getConfigFromEnv` function for environment-only configuration

### Changed

- Default export now uses Zod v4
- Zod v3 users should import from `zonv/v3`

## [1.5.0] - 2024-08-01

### Changed

- Removed lodash.get and lodash.set dependencies
- Implemented custom `get` utility function

## [1.4.0] - 2024-07-15

### Added

- Support for overriding nested config values via environment variables
- Triple underscore (`___`) delimiter for nested paths (e.g., `server___port`)

## [1.3.0] - 2024-06-01

### Changed

- Updated Zod peer dependency version

## [1.2.0] - 2024-05-15

### Changed

- Environment variable override syntax changed (removed dots)

## [1.1.0] - 2024-04-01

### Added

- Support for multiple config file paths
- Support for secrets files

## [1.0.0] - 2024-03-01

### Added

- Initial release
- Zod schema validation for configuration
- JSON file configuration source
- Environment variable overrides
- TypeScript support with full type inference

[Unreleased]: https://github.com/devnazim/zonv/compare/v2.2.2...HEAD
[2.2.2]: https://github.com/devnazim/zonv/compare/v2.2.0...v2.2.2
[2.2.0]: https://github.com/devnazim/zonv/compare/v2.1.3...v2.2.0
[2.1.3]: https://github.com/devnazim/zonv/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/devnazim/zonv/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/devnazim/zonv/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/devnazim/zonv/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/devnazim/zonv/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/devnazim/zonv/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/devnazim/zonv/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/devnazim/zonv/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/devnazim/zonv/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/devnazim/zonv/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/devnazim/zonv/releases/tag/v1.0.0
