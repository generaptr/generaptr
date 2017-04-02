const FileUtil = require('../commons/utils/fileUtil');
const DIRECTORY_STRUCTURE = require('../commons/constants/directoryStructure');
const RamlDataTypeConvertor = require('../commons/utils/ramlDataTypeConvertor');

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
                promises.push(new Promise((resolve, reject) => {
                    FileUtil.createDirectory(FileUtil.joinPaths(this.filePath, directory)).then(created => {
                        resolve();
                    }).catch(exception => {
                        reject(exception);
                    });
                }));
            });
        }

        return Promise.all(promises);
    }

    /**
     * Create type raml file for table
     * @param table
     * @returns {Promise}
     */
    createType(databaseEngine, table) {
        const doubleSpace = '  ';

        let objectInformation = '#%RAML 1.0 DataType\n'
            + 'type: object\n'
            + 'properties:';

        Object.keys(table.columns).map(key => {
            objectInformation += ('\n' + `${doubleSpace}` + key + (table.columns[key].nullable === 'NO' ? '' : '?') + ': ' + RamlDataTypeConvertor.convertType(databaseEngine, table.columns[key].type));
        });

        return FileUtil.writeFile(FileUtil.joinPaths(this.filePath, DIRECTORY_STRUCTURE.TYPES, (table.name + '.raml')), objectInformation);
    }

    /**
     * Create .raml type file for every table inside schema
     * @param schema - schema
     * @returns {Promise.<*>}
     */
    createTypes(schemaInformation) {
        const promises = [];

        schemaInformation.schema.map(table => {
            promises.push(this.createType(schemaInformation.databaseEngine, table));
        });

        return Promise.all(promises);
    }
}

module.exports = FileService;