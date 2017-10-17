import fileUtil from '../commons/utils/file';
import DIRECTORY_STRUCTURE from '../commons/constants/directoryStructure';
import typesGenerator from '../contentGenerators/spec/types';
import examplesGenerator from '../contentGenerators/spec/examples';
import specGenerator from '../contentGenerators/spec/spec';
import utils from '../commons/utils/utils';
import cacheUtil from '../commons/utils/cache';
import config from '../configs/config';
import { Schema, Table, RAMLApplicationInfo, Example } from '../commons/types';

/**
 * Class which implements the logic for implementing raml generation file related actions.
 *
 * @export
 * @class RamlFileOperations
 */
export default class RamlFileOperations {
  /**
   * Path to the folder where the raml will be generated.
   *
   * @private
   * @type {string}
   * @memberof ApiFileOperations
   */
  private filePath: string;

  public constructor(filePath: string) {
    this.filePath = fileUtil.normalizePath(filePath);
  }

  /**
   * Create directory structure for the application
   * @returns {Promise<boolean[]>} created directory structure.
   */
  public async createDirectoryStructure(): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];
    /* istanbul ignore next */
    if (!fileUtil.isDirectory(this.filePath)) {
      return Promise.reject('Invalid directory path');
    }
    Object.keys(DIRECTORY_STRUCTURE.RAML_STRUCTURE).map((directory: string) => {
      promises.push(
        fileUtil.createDirectory(
          fileUtil.joinPaths(
            this.filePath,
            DIRECTORY_STRUCTURE.RAML_STRUCTURE[directory],
          ),
        ),
      );
    });

    return Promise.all(promises);
  }

  /**
   * Create .raml type file for every table inside schema
   * @param {Schema} schema - schema tables(list of tables)
   * @returns {Promise.<boolean[]>} generated type files.
   */
  public async generateSchemaTypeFiles(schema: Schema): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];

    schema.map((table: Table) => {
      promises.push(
        fileUtil.writeFile(
          fileUtil.joinPaths(
            this.filePath,
            DIRECTORY_STRUCTURE.RAML_STRUCTURE.TYPES,
            `${utils.toTitleCase(table.name)}.raml`,
          ),
          typesGenerator.generateTypeContent(table),
        ),
      );
    });

    return Promise.all(promises);
  }

  /**
   * Generate api.raml spec for the whole api.
   *
   * @param {Schema} schema - database schema
   * @param {RAMLApplicationInfo} options - application info
   * @returns {Promise<boolean>} - true if spec generated
   */
  public async generateSchemaApiFiles(schema: Schema, options: RAMLApplicationInfo): Promise<boolean> {
    return fileUtil.writeFile(
      fileUtil.joinPaths(this.filePath, 'api.raml'),
      specGenerator.generateContent(schema, options),
    );
  }

  /**
   * Generate .json entity for every table from schema.
   * File will be saved on path: ./raml/types/entityName.json
   * @param {Schema} schema - schema containing tables.
   * @return {Promise.<boolean[]>} generated examle files.
   */
  public async generateSchemaExampleFiles(schema: Schema): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];

    schema.map((table: Table) => {
      const typeExampleGenerated: Example = examplesGenerator.generateTypeExampleContent(
        schema,
        table,
        config.INITIAL_DEPTH_LEVEL,
      );

      promises.push(
        fileUtil.writeFile(
          fileUtil.joinPaths(
            this.filePath,
            DIRECTORY_STRUCTURE.RAML_STRUCTURE.EXAMPLES,
            `${typeExampleGenerated.type}.json`,
          ),
          utils.convertToJSON(typeExampleGenerated.data),
        ),
      );
    });

    return Promise.all(promises);
  }

  /**
   * Generate .json Array entity for every array of objects saved in cache
   * @return {Promise.<boolean[]>} generated example files.
   */
  public async generateSchemaExamplesFilesFromCache(): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];

    Object.keys(cacheUtil.getByPrimeKey(examplesGenerator.PRIME_KEY))
      .filter((key: string) => key.includes('[]'))
      .map((key: string) => {
        promises.push(
          fileUtil.writeFile(
            fileUtil.joinPaths(
              this.filePath,
              DIRECTORY_STRUCTURE.RAML_STRUCTURE.EXAMPLES,
              `${utils.pluraliseWordArray(key)}.json`,
            ),
            utils.convertToJSON(
              cacheUtil.get(
                examplesGenerator.PRIME_KEY,
                key,
              ),
            ),
          ),
        );
      });

    return Promise.all(promises);
  }

  /**
   * Returns file path.
   *
   * @returns {string} file path
   */
  public getFilePath(): string {
    return this.filePath;
  }
}
