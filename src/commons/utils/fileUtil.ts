import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';

/**
 * Class which holds helper tools when working with files.
 *
 * @export
 */
export class FileUtil {

  /**
   * Normalize folder path
   * @param  filePath path to be normalized
   * @returns  normalized path
   */
  public normalizePath(filePath: string): string {
    return path.isAbsolute(filePath) ? (path.normalize(filePath)) :
      `${process.cwd()}${process.platform !== 'win32' ? '/' : '\\'}${path.normalize(filePath)}`;
  }

  /**
   * Check if a filePath represents the path for a directory or a file
   * @param  filePath - relative or absolute file path
   * @returns check if path is dir
   */
  public isDirectory(filePath: string): boolean {
    const normalizedFilePath: string = this.normalizePath(filePath);

    return Boolean(
      normalizedFilePath
        .substring(
          normalizedFilePath.lastIndexOf('/'),
          normalizedFilePath.length,
        )
        .indexOf('.'),
    );
  }

  /**
   * Create directory if not exist
   * @param  filePath path where the directory should be created.
   * @returns directory created
   */
  public async createDirectory(filePath: string): Promise<boolean> {
    const normalizedFilePath: string = this.normalizePath(filePath);

    return new Promise((resolve: Function, reject: Function): void => {
      fs.stat(normalizedFilePath, async (error: Error, stats: fs.Stats) => {
        if (error) {
          try {
            await fse.ensureDir(normalizedFilePath);
            resolve(true);
          } catch (ensureDirError) {
            /* istanbul ignore next */
            reject(ensureDirError);
          }
        } else {
          resolve(stats.isDirectory());
        }
      });
    });
  }

  /**
   * Join list of paths
   * @param paths array of paths that need to be merged
   * @returns  merged path
   */
  public joinPaths(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * Writes content into file.
   *
   * @param  filePath - destination file
   * @param  content - content to be written
   * @returns file written
   */
  public async writeFile(filePath: string, content: string): Promise<boolean> {
    return new Promise<boolean>((resolve: Function, reject: Function): void => {
      fs.writeFile(filePath, content, { encoding: 'UTF-8' }, (err: Error) => {
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
