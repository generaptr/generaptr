const utils = require('./utils');

class FileService {
    constructor(filePath) {
        if ((!filePath) || (typeof filePath !== 'string')) {
            throw new Error('FilePath not provided');
        }
        this.filePath = utils.normalizePath(filePath);
    }

    /**
     * Create directory structure for the application
     * @returns {Promise}
     */
    createDirectoryStructure() {
        return new Promise((resolve, reject) => {
            if (!utils.isDirectory(this.filePath)) {
                reject('Invalid directory path');
            } else {
                utils.createDirectory(this.filePath).then(created => {
                    resolve();
                }).catch(exception => {
                    reject(exception);
                });
            }
        });
    }
};

module.exports = FileService;