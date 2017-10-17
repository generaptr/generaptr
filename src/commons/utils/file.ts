import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';

/**
 * Class which holds helper tools when working with files.
 *
 * @export
 * @class FileUtil
 */
export class FileUtil {

  /**
   * Normalize folder path
   * @param {string} filePath path to be normalized
   * @returns {*} normalized path
   */
  public normalizePath(filePath: string): string {
    return path.isAbsolute(filePath) ? (path.normalize(filePath)) :
      `${process.cwd()}${process.platform !== 'win32' ? '/' : '\\'}${path.normalize(filePath)}`;
  }

  /**
   * Check if a filePath represents the path for a directory or a file
   * @param {string} filePath - relative or absolute file path
   * @returns {boolean} check if path is dir
   */
  public isDirectory(filePath: string): boolean {
    const normalizedFilePath: string = this.normalizePath(filePath);

    return Boolean(
      normalizedFilePath.substring(
        normalizedFilePath.lastIndexOf('/'),
        normalizedFilePath.length,
      ).indexOf('.'),
    );
  }

  /**
   * Create directory if not exist
   * @param {string} filePath path where the directory should be created.
   * @returns {Promise} directory created
   */
  public async createDirectory(filePath: string): Promise<boolean> {
    const normalizedFilePath: string = this.normalizePath(filePath);

    return new Promise<boolean>((resolve: Function, reject: Function): void => {
      fs.stat(normalizedFilePath, (err: Error, stat: fs.Stats) => {
        if (err) {
          /* istanbul ignore next */
          fse.ensureDir(normalizedFilePath, (ensureDirErr: Error) => {
            if (ensureDirErr) {
              reject(ensureDirErr);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(Boolean(stat.isDirectory()));
        }
      });
    });
  }

  /**
   * Join list of paths
   * @param {Array<string>} paths array of paths that need to be merged
   * @returns {string} merged path
   */
  public joinPaths(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * Writes content into file.
   *
   * @param {string} filePath - destination file
   * @param {string} content - content to be written
   * @returns {Promise} file written
   */
  public async writeFile(filePath: string, content: string): Promise<boolean> {
    return new Promise<boolean>((resolve: Function, reject: Function): void => {
      fs.writeFile(filePath, content, {encoding: 'UTF-8'}, (err: Error) => {
        if (err) {
          /* istanbul ignore next */
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default new FileUtil();
