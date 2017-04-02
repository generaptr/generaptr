const FileUtil = require('../commons/utils/fileUtil');
const DIRECTORY_STRUCTURE = require('../commons/constants/directoryStructure');
const RalmContentGenerator = require('../ralmGenerator/ralmContentGenerator');

class FileService {
    constructor(filePath) {
        if ((!filePath) || (typeof filePath !== 'string')) {
            throw new Error('FilePath not provided');
        }
        this.filePath = FileUtil.normalizePath(filePath);
    }

    /**
     * Create directory structure for the application
     * @returns {Promise}
     */
    createDirectoryStructure() {
        const promises = [];

        if (!FileUtil.isDirectory(this.filePath)) {
            return Promise.reject('Invalid directory path');
        } else {
            Object.values(DIRECTORY_STRUCTURE).map(directory => {
                promises.push(FileUtil.createDirectory(FileUtil.joinPaths(this.filePath, directory)));
            });

            return Promise.all(promises);
        }
    }

    /**
     * Create .raml type file for every table inside schema
     * @param schema - schema tables(list of tables)
     * @returns {Promise.<*>}
     */
    generateTypeFiles(schema) {
        const promises = [];

        schema.map(table => {
            promises.push(
                FileUtil.writeFile(
                    FileUtil.joinPaths(this.filePath, DIRECTORY_STRUCTURE.TYPES, (table.name + '.raml')),
                    RalmContentGenerator.generateTypeContent(table)
                )
            );
        });

        return Promise.all(promises);
    }
}

module.exports = FileService;