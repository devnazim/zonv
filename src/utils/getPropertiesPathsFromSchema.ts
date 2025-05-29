import { ZodObject, SomeZodObject } from 'zod';

export const getPropertiesPathsFromSchema = <S extends SomeZodObject>(schema: S) => {
  const paths: string[] = [];
  const getPaths = (obj: SomeZodObject, prefix: string[] = []) => {
    const keys = obj instanceof ZodObject ? Object.keys(obj.keyof().Values) : [];
    for (const key of keys) {
      paths.push([...prefix, key].join('.'));
      if (obj.shape[key] instanceof ZodObject) {
        getPaths(obj.shape[key], [...prefix, key]);
      }
    }
  };
  getPaths(schema);
  return paths;
};
