import { ZodObject } from 'zod';

export const getPropertiesPathsFromSchema = <S extends ZodObject>(schema: S) => {
  const paths: string[] = [];
  const getPaths = (obj: ZodObject, prefix: string[] = []) => {
    const keys = obj instanceof ZodObject ? obj.keyof().options : [];
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
