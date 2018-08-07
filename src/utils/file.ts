import * as fs from 'fs';

/**
 * Read the contents of a file at a given path
 *
 * @param {string} path - path to the file
 * @returns {string} - content of the specified file
 */
export const getContent = (path: string): string => {
  return fs.readFileSync(path).toString();
};