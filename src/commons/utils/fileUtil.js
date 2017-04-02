const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

class FileUtil {

    /**
     * Normalize folder path
     * @param filePath
     * @returns {*}
     */
    normalizePath(filePath) {
        return path.isAbsolute(filePath) ? (path.normalize(filePath)) :
            (process.cwd() + ((process.platform === 'win32') ? '\\' : '/') + path.normalize(filePath));
    };

    /**
     * Check if a filePath represents the path for a directory or a file
     * @param filePath - relative or absolute file path
     * @returns {boolean}
     */
    isDirectory(filePath) {
        filePath = this.normalizePath(filePath);

        return filePath.substring(filePath.lastIndexOf('/'), filePath.length).indexOf('.') < 0 ? true : false;
    }

    /**
     * Create directory if not exist
     * @param filePath
     * @returns {Promise}
     */
    createDirectory(filePath) {
        filePath = this.normalizePath(filePath);

        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stat) => {
                if (err) {
                    // create directory structure
                    fse.ensureDir(filePath, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    });
                } else {
                    resolve(stat.isDirectory() ? true : false);
                }
            });
        });
    }

    /**
     * Join list of paths
     * @param paths
     * @returns {string}
     */
    joinPaths(...paths) {
        return path.join(...paths);
    };

    /**
     *
     * @param filePath - destination file
     * @param content - content to be written
     * @returns {Promise}
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