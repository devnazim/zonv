import { readFileSync } from 'node:fs';

export const getFileContent = (path: string) => {
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
};
