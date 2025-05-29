import { resolve } from 'node:path';
import { cwd } from 'node:process';

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
