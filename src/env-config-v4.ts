import { z, ZodArray, ZodObject } from 'zod/v4';
import { dset } from 'dset';

import { getPropertiesPathsFromSchema } from './utils/getPropertiesPathsFromSchema-v4';
import { get } from './utils/get';

export const getConfigFromEnv = <S extends ZodObject>({ schema }: { schema: S }) => {
  const config = {};
  const propertiesPaths = getPropertiesPathsFromSchema(schema);
  for (const path of propertiesPaths) {
    try {
      const envValue = process.env[path.split('.').join('___')];
      if (envValue) {
        const schemaProp = get(schema.shape, path);
        const v = schemaProp instanceof ZodObject || schemaProp instanceof ZodArray ? JSON.parse(envValue) : envValue;
        dset(config, path, v);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return schema.parse(config) as z.infer<S>;
};
