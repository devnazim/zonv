# Zonv

Zonv is a package that enables you to validate your application configuration using Zod schemas. It supports multiple configuration sources, including json files and environment variables, with environment variables taking precedence and allow you to use complex nested data for your configuration.

## Features

- **Zod Schema Validation**: Define and validate your configuration with [Zod](https://github.com/colinhacks/zod) schemas.
- **Complex Configurations**: Use complex nesed data as configuration.
- **Multiple Sources**: Use files and environment variables as configuration sources.
- **Override Priority**: Environment variables override values specified in config files.
- **Isolated configuration for each developer**: Use default config/config.json file as your personal config and add it to gitignore. Use config/example.config.json as an example for other devs.
- **Multiple Schemas**: Use different validation schema for production, dev and staging environments.
- **Type Safety**: Get full TypeScript support for your configuration.

## Installation

```bash
npm install zonv
```

Or with Yarn:

```bash
yarn add zonv
```

Or with pnpm:

```bash
pnpm add zonv
```

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

### Support zod/v3

```typescript
// config.ts
import { z } from 'zod/v3';
import { getConfig } from 'zonv/v3';

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
import { getConfig } from 'zonv';
import { getConfigFromEnv } from 'zonv/env-config';

// Define your configuration schema
const configSchema = z.object({
  PORT: z.number().default(3000),
  API_BASE_URL: z.string().url(),
});

// Load configuration using env variables
const config = getConfigFromEnv({ schema: configSchema });

export { config };
```

### Support zod/v3

```typescript
// config.ts
import { z } from 'zod/v3';
import { getConfig } from 'zonv/v3';
import { getConfigFromEnv } from 'zonv/v3/env-config';

// Define your configuration schema
const configSchema = z.object({
  PORT: z.number().default(3000),
  API_BASE_URL: z.string().url(),
});

// Load configuration using env variables
const config = getConfigFromEnv({ schema: configSchema });

export { config };
```

### Configuration Sources

#### File

By default zonv use `config/config.json` and `secrets/secrets.json` as source files.
Provide configuration in a JSON file:

```javascript
// config/config.json
{
  "PORT": 8080,
  "DATABASE_URL": "https://my-dev-db/database"
}
```

```javascript
// secrets/secrets.json
{
  "SECRET_API_KEY": "MY_SECRET_KEY"
}
```

In order to isolate your personal setup add `config.json` and `secrets.json` to `.gitignore` and specify configuration expample in `example.config.json` and `example.secrets.json`

```
# .gitignore
config/config.json
secrets/secrets.json
```

```javascript
// config/example.config.json
{
  "PORT": 8080,
  "DATABASE_URL": "https://example.com/database"
}
```

```javascript
// secrets/example.secrets.json
{
  "JWT_SERCRT": "for dev env generate this value using echo -n {your secret} | sha256sum",
  "SOME_API_KEY": "ask admin for this key"
}
```

> ⚠️ WARNING: DON'T add secrets to your git repo. Note that are NO production or staging secrets. Only your personal secrets and `example.secrets.json` as an expample. Use environment variables or volume mapping with secrets managers for production.

Add config path to your tsconfig.json

```javascript
{
  paths: [
    "@/config": ["./config"],
  ]
}
```

Import your type-safe config

```typescript
const { config } from '@/config';

console.log(config.PORT); // Access type-safe configuration
```

#### Environment Variables

Override OR define configuration using environment variables:

```bash
PORT=4000 DATABASE_URL=https://new-db.example.com node app.js
```

OR use env package e.g. dotenv.

### Merging and Precedence

Zonv automatically merges configuration sources, with environment variables taking precedence over file-based configurations.

## API

### `zonv(options)`

#### Options:

- **`schema`** (Zod schema, required): The Zod schema used to validate your configuration.
- **`configPaths`** JSON source file path(s). By default is `config/config.json`. Possible values:
  - relative or absolute path e.g. `/path/config.json` OR `./path/config.json`
  - array of config paths to merge e.g. `[/tmp/path/config1.json, /tmp/path/config2.json]`
  - string with config paths separated by comma e.g. `"/tmp/path/config1.json, /tmp/path/config2.json"`

- **`secretsPaths`** JSON source file path(s). By default is `secrets/secrets.json`. Possible values:
  - relative or absolute path e.g. `/path/secrets.json` OR `./path/secrets.json`
  - array of config paths to merge e.g. `[/tmp/path/secrets1.json, /tmp/path/secrets2.json]`
  - string with config paths separated by comma e.g. `"/tmp/path/secrets1.json, /tmp/path/secrets2.json"`

- **`env`** string determine prefix for config file to load `{env}.config.json` e.g. if `env = production` zonv will use `production.config.json`

#### Returns:

A type-safe configuration object.

## Examples

Override default config file paths.

```typescript
const config = getConfig({
  schema: configSchema,
  configPaths: './path/config.json',
  secretsPaths: './path/secrets.json',
});
```

Use multiple config source files.

```typescript
const config = getConfig({
  schema: configSchema,
  configPaths: ['./path/config1.json', './path/config2.json'],
  secretsPaths: ['./path/secrets1.json', './path/secrets2.json'],
});
```

Specify multiple config paths with string value where paths are seperated by comma with environment variables.
This is might be usefull for configuring prod build with secrets manager and volume mapping.

```typescript
const config = getConfig({
  schema: configSchema,
  configPaths: process.env.CONFIG_PATHS, // value:  "./config/config-prod.json"
  secretsPaths: process.env.SECRETS_PATHS, // value:  "/tmp/secrets1.json, /tmp/secrets2.json"
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

process.env['server___port'] = 7000; // Use triple "_" symbol to name environment variable in order to override OR define nested property.

const config = getConfig({ schema: nestedSchema });

console.log(config.server.port); // 7000

export { config };
```

## Type Safety

Zonv ensures type safety for your configuration, meaning you get autocomplete and type checking in your TypeScript project. Errors in your configuration are caught at runtime during validation.

## Contributing

Contributions are welcome! If you have suggestions or issues, feel free to open a GitHub issue or submit a pull request.

---

Start building type-safe, validated configurations with Zonv today!
