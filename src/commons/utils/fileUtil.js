const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

class FileUtil {

  /**
   * Normalize folder path
   * @param {string} filePath path to be normalized
   * @returns {*} normalized path
   */
  normalizePath(filePath) {
    return path.isAbsolute(filePath) ? (path.normalize(filePath)) :
      (process.cwd() + ((process.platform === 'win32') ? '\\' : '/') + path.normalize(filePath));
  }

  /**
   * Check if a filePath represents the path for a directory or a file
   * @param {string} filePath - relative or absolute file path
   * @returns {boolean} check if path is dir
   */
  isDirectory(filePath) {
    const normalizedFilePath = this.normalizePath(filePath);

    return Boolean(normalizedFilePath.substring(normalizedFilePath.lastIndexOf('/'), normalizedFilePath.length).indexOf('.'));
  }

  /**
   * Create directory if not exist
   * @param {string} filePath path where the directory should be created.
   * @returns {Promise} directory created
   */
  createDirectory(filePath) {
    const normalizedFilePath = this.normalizePath(filePath);

    return new Promise((resolve, reject) => {
      fs.stat(normalizedFilePath, (err, stat) => {
        if (err) {
          // create directory structure
          fse.ensureDir(normalizedFilePath, ensureDirErr => {
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
  joinPaths(...paths) {
    return path.join(...paths);
  }

  /**
   *
   * @param {string} filePath - destination file
   * @param {string} content - content to be written
   * @returns {Promise} file written
   */
  writeFile(filePath, content) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, content, 'UTF-8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new FileUtil();
