const Utils = require('../commons/utils/utils');
const DIRECTORY_STRUCTURE = require('../commons/constants/directoryStructure');

class FileService {
    constructor(filePath) {
        if ((!filePath) || (typeof filePath !== 'string')) {
            throw new Error('FilePath not provided');
        }
        this.filePath = Utils.normalizePath(filePath);
    }

    /**
     * Create directory structure for the application
     * @returns {Promise}
     */
    createDirectoryStructure() {
        const promises = [];

        if (!Utils.isDirectory(this.filePath)) {
            return Promise.reject('Invalid directory path');
        } else {
            Object.values(DIRECTORY_STRUCTURE).map(directory => {
                promises.push(new Promise((resolve, reject) => {
                    Utils.createDirectory(Utils.joinPaths(this.filePath, directory)).then(created => {
                        resolve();
                    }).catch(exception => {
                        reject(exception);
                    });
                }));
            });
        }
        
        return Promise.all(promises);
    }
}

module.exports = FileService;