# Zonv

Zonv is a package that enables you to validate your application configuration using Zod schemas. It supports multiple configuration sources, including JSON files and environment variables, with environment variables taking precedence. It also allows you to use complex nested data for your configuration.

## Features

- **Zod Schema Validation**: Define and validate your configuration with [Zod](https://github.com/colinhacks/zod) schemas.
- **Complex Configurations**: Use complex nested data as configuration.
- **Multiple Sources**: Use files and environment variables as configuration sources.
- **Override Priority**: Environment variables override values specified in config files.
- **Isolated configuration for each developer**: Use default config/config.json file as your personal config and add it to gitignore. Use config/example.config.json as an example for other devs.
- **Multiple Schemas**: Use different validation schema for production, dev and staging environments.
- **Type Safety**: Get full TypeScript support for your configuration.

## Requirements

- Node.js >= 18.0.0
- Zod ^3.0.0 or ^4.0.0 (peer dependency)

## Module Support

Zonv supports both **ESM** and **CommonJS** module systems:

```typescript
// ESM
import { getConfig } from 'zonv';

// CommonJS
const { getConfig } = require('zonv');
```

## Installation

```bash
npm install zonv zod
```

Or with Yarn:

```bash
yarn add zonv zod
```

Or with pnpm:

```bash
pnpm add zonv zod
```

> **Note:** Zod is a peer dependency and must be installed separately.

## Usage

### Basic Example

1. Define your configuration schema using Zod.
2. Use Zonv to load and validate your configuration (config/config.json by default).

```typescript
// config.ts
import { z } from 'zod';
import { getConfig } from 'zonv';

// Define your configuration schema
const configSchema = z.object({
  PORT: z.number().default(3000),
  DATABASE_URL: z.string().url(),
});

// Load and validate your configuration from config folder
const config = getConfig({
  schema: configSchema,
  env: process.env.APP_ENV, // optional. Determine file to get config from (config/{env}.config.json).
});

export { config };
```

### Zod Version Support

Zonv supports both **Zod v4** (default) and **Zod v3**. The default import uses Zod v4. If your project uses Zod v3, use the `/v3` import path:

```typescript
// For Zod v3 projects
import { z } from 'zod';
import { getConfig } from 'zonv/v3';

const configSchema = z.object({
  PORT: z.number().default(3000),
  DATABASE_URL: z.string().url(),
});

const config = getConfig({
  schema: configSchema,
  env: process.env.APP_ENV,
});

export { config };
```

| Zod Version   | Import Path                           |
| ------------- | ------------------------------------- |
| v4 (default)  | `import { getConfig } from 'zonv'`    |
| v3            | `import { getConfig } from 'zonv/v3'` |
| v4 (explicit) | `import { getConfig } from 'zonv/v4'` |

### Project structure example:

```plaintext
project/
├── config/
│   ├── production.config.json
│   ├── staging.config.json
│   ├── example.config.json
│   └── config.json
├── secrets/
│   ├── example.secrets.json # only for configuration demo
│   └── secrets.json # add to .gitignore
├── config.ts
├── .gitignore
└── tsconfig.json
```

> ℹ️ It is also possible to use environment variables

### Use environment variables ONLY

In some cases files are not available e.g. react native setup.

```typescript
// config.ts
import { z } from 'zod';
import { getConfigFromEnv } from 'zonv/env-config';

// Define your configuration schema
const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  API_BASE_URL: z.string().url(),
});

// Load configuration using env variables
const config = getConfigFromEnv({ schema: configSchema });

export { config };
```

For Zod v3 with env-only config:

```typescript
import { z } from 'zod';
import { getConfigFromEnv } from 'zonv/v3/env-config';

const configSchema = z.object({
  PORT: z.number().default(3000),
  API_BASE_URL: z.string().url(),
});

const config = getConfigFromEnv({ schema: configSchema });

export { config };
```

### Configuration Sources

#### File

By default zonv uses `config/config.json` and `secrets/secrets.json` as source files.

> **Note:** Config files are optional. If a file doesn't exist, zonv silently continues without it. However, if a file exists but contains invalid JSON or is not a JSON object, an error will be thrown.

Provide configuration in a JSON file:

**config/config.json**

```json
{
  "PORT": 8080,
  "DATABASE_URL": "https://my-dev-db/database"
}
```

**secrets/secrets.json**

```json
{
  "SECRET_API_KEY": "MY_SECRET_KEY"
}
```

In order to isolate your personal setup add `config.json` and `secrets.json` to `.gitignore` and specify configuration example in `example.config.json` and `example.secrets.json`

```
# .gitignore
config/config.json
secrets/secrets.json
```

**config/example.config.json**

```json
{
  "PORT": 8080,
  "DATABASE_URL": "https://example.com/database"
}
```

**secrets/example.secrets.json**

```json
{
  "JWT_SECRET": "for dev env generate this value using: echo -n {your secret} | sha256sum",
  "SOME_API_KEY": "ask admin for this key"
}
```

> WARNING: DON'T add secrets to your git repo. Note that there are NO production or staging secrets. Only your personal secrets and `example.secrets.json` as an example. Use environment variables or volume mapping with secrets managers for production.

Add config path to your tsconfig.json:

```json
{
  "compilerOptions": {
    "paths": {
      "@/config": ["./config"]
    }
  }
}
```

Import your type-safe config:

```typescript
import { config } from '@/config';

console.log(config.PORT); // Access type-safe configuration
```

#### Environment Variables

Override OR define configuration using environment variables:

```bash
PORT=4000 DATABASE_URL=https://new-db.example.com node app.js
```

OR use env package e.g. dotenv.

> **Note:** Environment variable names are **case-sensitive** and must match the schema property names exactly. For example, if your schema has `PORT`, you must use `PORT` (not `port` or `Port`). Empty string environment variables are ignored and won't override file-based configuration.

### Merging and Precedence

Zonv automatically merges configuration sources in the following order (later sources override earlier ones):

1. Config files (`configPath`)
2. Secrets files (`secretsPath`)
3. Environment variables (highest priority)

### Type Coercion for Environment Variables

Environment variables are always strings. Zonv handles type conversion as follows:

- **Strings**: Work directly, no conversion needed
- **Numbers/Booleans**: Use Zod's `z.coerce.*` methods for automatic conversion
- **Objects/Arrays**: Provide as JSON strings in the environment variable

```typescript
const configSchema = z.object({
  PORT: z.coerce.number(), // "8080" -> 8080
  DEBUG: z.coerce.boolean(), // "true" -> true, but "false" -> true too! (any non-empty string is truthy)
  // For proper "true"/"false" handling, use: z.enum(["true", "false"]).transform(v => v === "true")
  NAME: z.string(), // "myapp" -> "myapp"
  TAGS: z.array(z.string()), // '["a","b"]' -> ["a", "b"]
  SERVER: z.object({
    // '{"host":"localhost"}' -> { host: "localhost" }
    host: z.string(),
  }),
});

// Set env vars
process.env.PORT = '8080';
process.env.DEBUG = 'true';
process.env.TAGS = '["production", "api"]';
process.env.SERVER = '{"host": "0.0.0.0"}';
```

> **Important:** For objects and arrays from environment variables, the value must be valid JSON.

## API

### `getConfig(options)`

#### Options:

- **`schema`** (Zod schema, required): The Zod schema used to validate your configuration.
- **`configPath`** JSON source file path(s). By default is `config/config.json`. Possible values:
  - relative or absolute path e.g. `/path/config.json` OR `./path/config.json`
  - array of config paths to merge e.g. `[/tmp/path/config1.json, /tmp/path/config2.json]`
  - string with config paths separated by comma e.g. `"/tmp/path/config1.json, /tmp/path/config2.json"`

- **`secretsPath`** JSON source file path(s). By default is `secrets/secrets.json`. Possible values:
  - relative or absolute path e.g. `/path/secrets.json` OR `./path/secrets.json`
  - array of config paths to merge e.g. `[/tmp/path/secrets1.json, /tmp/path/secrets2.json]`
  - string with config paths separated by comma e.g. `"/tmp/path/secrets1.json, /tmp/path/secrets2.json"`

- **`env`** string determine prefix for config file to load `{env}.config.json` e.g. if `env = production` zonv will use `production.config.json`

- **`debug`** (boolean, optional): Enable debug logging to see which files and environment variables are being loaded. Useful for troubleshooting configuration issues.

- **`delimiter`** (string, optional): The delimiter used to separate nested paths in environment variable names. Defaults to `___` (triple underscore). For example, with `delimiter: '__'`, use `server__port` instead of `server___port`.

#### Returns:

A type-safe configuration object.

### `getConfigFromEnv(options)`

Use this function when you only want to load configuration from environment variables (no files).

#### Options:

- **`schema`** (Zod schema, required): The Zod schema used to validate your configuration.
- **`debug`** (boolean, optional): Enable debug logging.
- **`delimiter`** (string, optional): The delimiter for nested paths. Defaults to `___`.

#### Returns:

A type-safe configuration object.

#### Import paths:

| Zod Version   | Import Path                                             |
| ------------- | ------------------------------------------------------- |
| v4 (default)  | `import { getConfigFromEnv } from 'zonv/env-config'`    |
| v3            | `import { getConfigFromEnv } from 'zonv/v3/env-config'` |
| v4 (explicit) | `import { getConfigFromEnv } from 'zonv/v4/env-config'` |

### `getConfigAsync(options)`

Async version of `getConfig` that loads configuration files in parallel for better performance.

#### Options:

Same as `getConfig`.

#### Returns:

A Promise resolving to a type-safe configuration object.

```typescript
import { getConfigAsync } from 'zonv';

const config = await getConfigAsync({
  schema: configSchema,
  configPath: ['./config/base.json', './config/overrides.json'],
});
```

## Examples

Override default config file paths.

```typescript
const config = getConfig({
  schema: configSchema,
  configPath: './path/config.json',
  secretsPath: './path/secrets.json',
});
```

Use multiple config source files.

```typescript
const config = getConfig({
  schema: configSchema,
  configPath: ['./path/config1.json', './path/config2.json'],
  secretsPath: ['./path/secrets1.json', './path/secrets2.json'],
});
```

Specify multiple config paths with string value where paths are separated by comma with environment variables.
This might be useful for configuring prod build with secrets manager and volume mapping.

```typescript
const config = getConfig({
  schema: configSchema,
  configPath: process.env.CONFIG_PATHS, // value:  "./config/config-prod.json"
  secretsPath: process.env.SECRETS_PATHS, // value:  "/tmp/secrets1.json, /tmp/secrets2.json"
});
```

Handle nested configurations and default values:

```typescript
const nestedSchema = z.object({
  server: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(3000),
  }),
  database: z.object({
    url: z.string().url(),
    poolSize: z.number().default(10),
  }),
});

const config = getConfig({ schema: nestedSchema });

export { config };
```

Override nested values with environment variable

```typescript
const nestedSchema = z.object({
  server: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(3000),
  }),
  database: z.object({
    url: z.string().url(),
    poolSize: z.number().default(10),
  }),
});

process.env['server___port'] = '7000'; // Use triple "_" symbol to name environment variable in order to override OR define nested property.

const config = getConfig({ schema: nestedSchema });

console.log(config.server.port); // 7000

export { config };
```

## Async API

For better performance in async contexts, use `getConfigAsync()` which loads files in parallel:

```typescript
import { getConfigAsync } from 'zonv';

const config = await getConfigAsync({
  schema: configSchema,
  configPath: ['./config/base.json', './config/overrides.json'],
});
```

This is especially useful when loading multiple configuration files, as they are loaded in parallel rather than sequentially.

## Custom Delimiter

By default, zonv uses `___` (triple underscore) as the delimiter for nested paths in environment variables. You can customize this:

```typescript
const config = getConfig({
  schema: nestedSchema,
  delimiter: '__', // Use double underscore instead
});

// Now use: server__port=8080 instead of server___port=8080
```

This is useful when integrating with systems that have restrictions on environment variable naming.

## Debug Mode

Enable debug mode to troubleshoot configuration loading issues:

```typescript
const config = getConfig({
  schema: configSchema,
  debug: true,
});

// Output:
// [zonv] Loading config from: config/config.json
// [zonv] Loading config from: secrets/secrets.json
// [zonv] Applied env var: PORT = 8080
// [zonv] Applied env var: DATABASE_URL = postgres://localhost/db
```

This is useful for understanding which configuration files are being loaded and which environment variables are being applied.

## Type Safety

Zonv ensures type safety for your configuration, meaning you get autocomplete and type checking in your TypeScript project. Errors in your configuration are caught at runtime during validation.

## Error Handling

Zonv throws errors in the following scenarios:

| Scenario                                     | Error Message                                                     |
| -------------------------------------------- | ----------------------------------------------------------------- |
| Schema validation fails                      | Throws `ZodError` with validation issues                          |
| Invalid JSON in config file                  | `Failed to parse JSON in config file "{path}": {message}`         |
| Config file is not a JSON object             | `Config file "{path}" must contain a JSON object, but got {type}` |
| Invalid JSON in env var (for objects/arrays) | `Failed to parse environment variable "{key}": {message}`         |
| Empty delimiter                              | `Delimiter cannot be an empty string`                             |

Example of handling validation errors:

```typescript
import { getConfig } from 'zonv';
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.number(),
  DATABASE_URL: z.string().url(),
});

try {
  const config = getConfig({ schema: configSchema });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Configuration validation failed:');
    error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }
  throw error;
}
```

## Contributing

Contributions are welcome! If you have suggestions or issues, feel free to open a GitHub issue or submit a pull request.

---

Start building type-safe, validated configurations with Zonv today!
