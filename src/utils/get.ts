export const get = (obj: any, path: string | string[]) => {
  if (typeof obj !== 'object' || !path) {
    return undefined;
  }
  let currValue = obj;
  const paths = Array.isArray(path) ? path : path.split('.');
  for (const prop of paths) {
    currValue = currValue?.[prop];
  }
  return currValue;
};
