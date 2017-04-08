const FileUtil = require('../commons/utils/fileUtil');
const DIRECTORY_STRUCTURE = require('../commons/constants/directoryStructure');
const RamlContentGenerator = require('../ramlGenerator/ramlContentGenerator');
const ExamplesContentGenerator = require('../ramlGenerator/examplesContentGenerator');
const Utils = require('../commons/utils/utils');

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
                    FileUtil.joinPaths(this.filePath, DIRECTORY_STRUCTURE.TYPES, (Utils.toTitleCase(table.name) + '.raml')),
                    RamlContentGenerator.generateTypeContent(table)
                )
            );
        });

        return Promise.all(promises);
    }

    /**
     * Generate .json entity for every table from schema.
     * File will be saved on path: ./raml/types/entityName.json
     * @param schema - schema containing tables.
     * Table structure: {
     *  name: 'tableName',
     *  columns: [
     *   {
     *      name: 'id',
     *      ...
     *   }
     *  ]
     * }
     * @return {Promise.<*>}
     */
    generateTypeExampleFiles(schema) {
        const promises = [];

        schema.map(table => {
            const typeExampleGenerated = ExamplesContentGenerator.generateTypeExampleContent(table);

            promises.push(
                FileUtil.writeFile(
                    FileUtil.joinPaths(this.filePath, DIRECTORY_STRUCTURE.EXAMPLES, (typeExampleGenerated.type + '.json')),
                    Utils.convertToJSON(typeExampleGenerated.data)
                )
            )
        });

        return Promise.all(promises);
    }

    generateTypeExamples(schema) {

    }
}

module.exports = FileService;