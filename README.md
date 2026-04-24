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

### Tested Zod Versions

| Zod Version | Status | Notes                        |
| ----------- | ------ | ---------------------------- |
| 3.24.x      | Tested | Use `zonv/v3` import path    |
| 4.3.x       | Tested | Default import (recommended) |

> **Note on Zod 4.3.x**: This version introduced some breaking changes to `.pick()`, `.omit()`, and `.extend()` methods when used on schemas with refinements. These changes don't affect zonv's functionality, but may affect your schema definitions. See the [Zod 4.3.0 release notes](https://github.com/colinhacks/zod/releases/tag/v4.3.0) for details.

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

Then import the validated config from other files through a TypeScript path alias after configuring the alias shown below:

```typescript
// server.ts
import { config } from '@config'; // TypeScript path alias that points to ./config.ts (configure the same alias in your runtime or bundler)

console.log(config.PORT); // Full type safety and autocomplete from your schema
```

> `@config` is a TypeScript path alias. It keeps imports clean while preserving type safety and editor autocomplete because `config` is inferred from your Zod schema. If you run compiled JavaScript directly, make sure your runtime or bundler resolves the same alias too.

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

By default, `getConfigFromEnv()` reads from `process.env`. To read from custom environment-like sources, pass them with `envSources` from lower to higher precedence (later entries override earlier ones):

```typescript
const config = getConfigFromEnv({
  schema: configSchema,
  envSources: [import.meta.env, process.env],
});
```

For Zod v3 with env-only config:

```typescript
import { z } from 'zod';
import { getConfigFromEnv } from 'zonv/v3/env-config';

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  API_BASE_URL: z.string().url(),
});

const config = getConfigFromEnv({ schema: configSchema });

export { config };
```

Environment variables arrive as strings, so use `z.coerce.number()` for numbers and an explicit transform for booleans, for example `z.enum(['true', 'false']).transform((v) => v === 'true')`.

### Next.js Integration

Zonv works seamlessly with Next.js. The recommended approach is to create separate configs for server-side and client-side (public) environment variables using `getConfigFromEnv`.

#### Project Structure

```plaintext
project/
├── config/
│   ├── server.ts      # Server-side config (secrets, API keys)
│   ├── public.ts      # Client-side config (NEXT_PUBLIC_* vars)
│   └── index.ts       # Barrel export
├── app/
│   └── page.tsx
├── .env.local
└── .env.example
```

#### Server Configuration

Create `config/server.ts` for server-only environment variables (database URLs, API secrets, etc.):

```typescript
// config/server.ts
import { z } from 'zod';
import { getConfigFromEnv } from 'zonv/env-config';

const serverConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  API_SECRET_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
});

export const serverConfig = getConfigFromEnv({
  schema: serverConfigSchema,
});

export type ServerConfig = typeof serverConfig;
```

#### Public Configuration

Create `config/public.ts` for client-safe environment variables. In Next.js, these must be prefixed with `NEXT_PUBLIC_`:

```typescript
// config/public.ts
import { z } from 'zod';
import { getConfigFromEnv } from 'zonv/env-config';

const publicConfigSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('My App'),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_ENABLE_DEBUG: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

export const publicConfig = getConfigFromEnv({
  schema: publicConfigSchema,
});

export type PublicConfig = typeof publicConfig;
```

#### Barrel Export

Create `config/index.ts` for convenient imports:

```typescript
// config/index.ts
export { serverConfig, type ServerConfig } from './server';
export { publicConfig, type PublicConfig } from './public';
```

#### Usage in Components

Server Components can access both server and public configs:

```typescript
// app/page.tsx (Server Component)
import { serverConfig } from "@/config/server";
import { publicConfig } from "@/config/public";

export default function Home() {
  return (
    <div>
      <h1>{publicConfig.NEXT_PUBLIC_APP_NAME}</h1>
      <p>Environment: {serverConfig.NODE_ENV}</p>
      <p>Debug: {publicConfig.NEXT_PUBLIC_ENABLE_DEBUG ? "enabled" : "disabled"}</p>
    </div>
  );
}
```

Client Components should only use public config:

```typescript
// components/ClientComponent.tsx
"use client";

import { publicConfig } from "@/config/public";

export function ClientComponent() {
  return <p>API URL: {publicConfig.NEXT_PUBLIC_API_URL}</p>;
}
```

#### Environment Variables Example

```bash
# .env.local

# Server-side (keep secret)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
AUTH_SECRET=your-super-secret-key-at-least-32-characters
API_SECRET_KEY=sk-your-api-secret-key

# Client-side (exposed to browser)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_ANALYTICS_ID=GA-XXXXXXXXX
NEXT_PUBLIC_ENABLE_DEBUG=false
```

> **Important:** Server config variables are only available in Server Components, API Routes, and server-side functions.

### Astro Integration

Astro app modules expose `import.meta.env`, while server-side code can also read private secrets through the usual server environment access. Use zonv's default `process.env` behavior for private server secrets, and pass `import.meta.env` explicitly only for public/client-safe config.

#### Server Configuration

```typescript
// src/config/server.ts
import { z } from 'zod';
import { getConfigFromEnv } from 'zonv/env-config';

export const serverConfig = getConfigFromEnv({
  schema: z.object({
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    MODE: z.enum(['development', 'production']).default('development'),
  }),
});
```

This keeps private values such as `DATABASE_URL` and `AUTH_SECRET` on the server side instead of recommending `import.meta.env` for secrets.

#### Public Configuration

In Astro, only `PUBLIC_*` variables are available in client-side code.

```typescript
// src/config/public.ts
import { z } from 'zod';
import { getConfigFromEnv } from 'zonv/env-config';

export const publicConfig = getConfigFromEnv({
  schema: z.object({
    PUBLIC_API_URL: z.string().url(),
    PUBLIC_APP_NAME: z.string().default('My Astro App'),
    PUBLIC_ENABLE_DEBUG: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
  }),
  envSources: [import.meta.env],
});
```

#### Usage in Astro

```astro
---
import { publicConfig } from '../config/public';
import { serverConfig } from '../config/server';
---

<h1>{publicConfig.PUBLIC_APP_NAME}</h1>
<p>{serverConfig.MODE}</p>
<p>{publicConfig.PUBLIC_API_URL}</p>
```

> **Important:** `import.meta.env` is available in Astro app modules, routes, and islands, but not in `astro.config.*`. Use `process.env` or Vite's `loadEnv()` there instead.

> **Note:** Astro and Vite also expose built-in typed flags such as `import.meta.env.DEV`, `PROD`, and `SSR`. Those values can be passed through `envSources` directly without string coercion.

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

Add a TypeScript path alias to your tsconfig.json:

```json
{
  "compilerOptions": {
    "paths": {
      "@config": ["./config.ts"]
    }
  }
}
```

> `paths` helps TypeScript and your editor resolve `@config`. If your runtime or bundler does not support this alias, either configure the same alias there too or use a relative import instead.

Import your type-safe config:

```typescript
import { config } from '@config';

console.log(config.PORT); // Access validated config with type safety and autocomplete
```

#### Environment Variables

Override OR define configuration using environment variables:

```bash
PORT=4000 DATABASE_URL=https://new-db.example.com node app.js
```

OR use env package e.g. dotenv.

> **Note:** Environment variable names are **case-sensitive** and must match the schema property names exactly. For example, if your schema has `PORT`, you must use `PORT` (not `port` or `Port`). Empty strings from `process.env` are ignored and won't override file-based configuration, while custom `envSources` can intentionally provide `''`.

### Merging and Precedence

Zonv automatically merges configuration sources in the following order (later sources override earlier ones):

1. Config files (`configPath`)
2. Secrets files (`secretsPath`)
3. `envSources` in array order (defaults to `[process.env]`)

`getConfigFromEnv()` uses only `envSources`, and later entries override earlier ones there as well.

```typescript
const config = getConfig({
  schema: configSchema,
  envSources: [import.meta.env, process.env],
});
```

### Type Coercion for Environment Variables

When values come from `process.env`, `import.meta.env`, or `.env` files, custom keys typically arrive as strings. Zonv handles type conversion as follows:

- **Strings**: Work directly, no conversion needed
- **Numbers/Booleans**: Use Zod's `z.coerce.*` methods for automatic conversion
- **Objects/Arrays**: Provide as JSON strings in the environment variable

If you pass custom `envSources`, already-typed values such as numbers, booleans, objects, and arrays are also supported directly.

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

- **`envSources`** (array, optional): Ordered environment-like sources to apply after files. Defaults to `[process.env]`. Later entries override earlier ones. Useful for sources such as `import.meta.env`.

- **`delimiter`** (string, optional): The delimiter used to separate nested paths in environment variable names. Defaults to `___` (triple underscore). Any non-empty string is supported. For example, with `delimiter: '__'`, use `server__port` instead of `server___port`.

#### Returns:

A type-safe configuration object.

### `getConfigFromEnv(options)`

Use this function when you only want to load configuration from environment variables (no files).

#### Options:

- **`schema`** (Zod schema, required): The Zod schema used to validate your configuration.
- **`debug`** (boolean, optional): Enable debug logging.
- **`envSources`** (array, optional): Ordered environment-like sources to apply. Defaults to `[process.env]`. Later entries override earlier ones.
- **`delimiter`** (string, optional): The delimiter for nested paths. Defaults to `___`. Any non-empty string is supported.

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

Use custom environment-like sources.

```typescript
const config = getConfig({
  schema: configSchema,
  envSources: [import.meta.env, process.env],
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

`delimiter` accepts any non-empty string. `.` is also supported when your runtime or process manager can provide keys like `api.key`, but `__` or `___` is usually easier to work with in shell-based workflows.

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
