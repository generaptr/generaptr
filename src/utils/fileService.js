const fs = require('fs');

class FileService {
    constructor(filePath) {
        this.filePath = filePath;

        if ((!filePath) || (typeof filePath !== 'string')) {
            throw new Error('FilePath not provided');
        }
    }

    /**
     * Check if output directory exists
     * @param filePath
     * @returns {Promise}
     */
    checkOutputPath() {
        return new Promise((resolve, reject) => {
            fs.stat(this.filePath, (err, stat) => {
               if (err) {
                   reject(err.message);
               }

               if (!stat) {
                   // todo: here
               }

               if (!stat.isDirectory()) {
                   reject('Invalid folder destination');
               }
               resolve();
            });
        });
    }

};

module.exports = FileService;