import { z, ZodArray, ZodObject, SomeZodObject } from 'zod';
import set from 'lodash.set';

import { getPropertiesPathsFromSchema } from './utils/getPropertiesPathsFromSchema.js';
import { get } from './utils/get';

export const getConfigFromEnv = <S extends SomeZodObject>({ schema }: { schema: S }) => {
  const config = {};
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
