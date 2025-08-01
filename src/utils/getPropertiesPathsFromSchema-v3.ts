import { ZodObject, SomeZodObject } from 'zod/v3';

export const getPropertiesPathsFromSchema = <S extends SomeZodObject>(schema: S) => {
  const paths: string[] = [];
  const getPaths = (obj: SomeZodObject, prefix: string[] = []) => {
    let keys: string[] = [];
    try {
      // const keys = obj instanceof ZodObject ? Object.keys(obj.keyof().Values) : [];
      // * NOTE: for some environments using searilization isntanceof check will not work.
      keys = Object.keys(obj.keyof().Values) as string[];
    } catch (e) {}
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
