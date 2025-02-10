import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { readFileSync } from 'node:fs';
import { z, ZodArray, ZodObject } from 'zod';
import merge from 'lodash/merge';
import set from 'lodash/set';
import get from 'lodash/get';

function getFileContent(path: string) {
  let fileContent;
  try {
    fileContent = readFileSync(path, { encoding: 'utf-8' });
  } catch (e) {
    // * NOTE: readFileSync throws error with Type NodeJS.ErrnoException
    // eslint-disable-next-line no-undef
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
      // eslint-disable-next-line no-console
      console.error(e);
      throw e;
    } else {
      return {};
    }
  }
  if (fileContent) {
    return JSON.parse(fileContent);
  }
}

const buildArrayFromString = (str: string) => {
  const regex = /\s+|,\s*/gm;
  return str.split(regex);
};

export const getPaths = ({ type, path, env }: { type: 'config' | 'secrets'; path?: string[] | string; env?: string }) => {
  const pathArr: string[] = [];
  if (Array.isArray(path) && path.length) {
    pathArr.push(...path);
  } else if (typeof path === 'string' && path.length) {
    pathArr.push(...buildArrayFromString(path));
  } else {
    pathArr.push(resolve(cwd(), `./${type}/${env ? `${env}.` : ''}${type}.json`));
  }
  return pathArr.filter((p) => p.trim().length > 0);
};

const getPropertiesPathsFromSchema = <S extends ZodObject<any, any, z.ZodTypeAny, any, any>>(schema: S) => {
  const paths: string[] = [];
  const getPaths = (obj: ZodObject<any, any, z.ZodTypeAny, any, any>, prefix: string[] = []) => {
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

export const getConfig = <S extends ZodObject<any, any, z.ZodTypeAny, any, any>>({
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
      const envValue = process.env[path];
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
