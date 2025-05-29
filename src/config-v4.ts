import { z, ZodArray, ZodObject } from 'zod/v4';
import merge from 'lodash.merge';
import set from 'lodash.set';

import { getPaths } from './utils/getPaths';
import { getFileContent } from './utils/getFileContent';
import { getPropertiesPathsFromSchema } from './utils/getPropertiesPathsFromSchema-v4';
import { get } from './utils/get';

export const getConfig = <S extends ZodObject>({
  schema,
  configPath,
  secretsPath,
  env,
}: {
  schema: S;
  configPath?: string | string[];
  secretsPath?: string | string[];
  env?: string;
}) => {
  const config = {};
  const filePaths = [...getPaths({ type: 'config', path: configPath, env }), ...getPaths({ type: 'secrets', path: secretsPath, env })];
  for (const path of filePaths) {
    merge(config, getFileContent(path));
  }
  const propertiesPaths = getPropertiesPathsFromSchema(schema);
  for (const path of propertiesPaths) {
    try {
      const envValue = process.env[path.split('.').join('___')];
      if (envValue) {
        const schemaProp = get(schema.shape, path);
        const v = schemaProp instanceof ZodObject || schemaProp instanceof ZodArray ? JSON.parse(envValue) : envValue;
        set(config, path, v);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return schema.parse(config) as z.infer<S>;
};
