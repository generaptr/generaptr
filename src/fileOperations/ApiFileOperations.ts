import * as chalk from 'chalk';
import { exec } from 'child_process';
import fileUtil from '../commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../commons/constants/directoryStructure';
import packageJsonGenerator from '../generators/api/packageJson';
import modelGenerator from '../generators/api/models';
import odmFileOperations from './api/odmFileOperations';
import configFileOperations from './api/configurationsFileOperations';
import modelsFileOperations from './api/modelsFileOperations';
import repositoriesFileOperations from './api/repositoriesFileOperations';
import servicesFileOperations from './api/servicesFileOperations';
import controllersFileOperations from './api/controllersFileOperations';
import commonsFileOperations from './api/commonsFileOperations';
import { PackageJsonInfo, ConnectionData, Schema } from '../commons/types';
/**
 * Class which implements the logic for implementing api generation file related actions.
 *
 * @export
 * @class ApiFileOperations
 */
export default class ApiFileOperations {

  /**
   * Path to the folder where the api will be generated.
   *
   * @private
   * @type {string}
   * @memberOf ApiFileOperations
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
    Object.keys(DIRECTORY_STRUCTURE.API_STRUCTURE).map((directory: string) => {
      promises.push(
        fileUtil.createDirectory(
          fileUtil.joinPaths(
            this.filePath,
            DIRECTORY_STRUCTURE.API_STRUCTURE[directory],
          ),
        ),
      );
    });

    return Promise.all(promises);
  }

  /**
   * Creates package json
   *
   * @param {PackageJsonInfo} options - package json options
   * @param {string} dialect - database dialect
   * @returns {Promise<boolean>} created package json
   */
  public async createPackageJson(options: PackageJsonInfo, dialect: string): Promise<boolean> {
    console.log(`running: ${chalk.green('initialize package.json')}`);

    return fileUtil.writeFile(
      fileUtil.joinPaths(this.filePath, 'package.json'),
      packageJsonGenerator.getPackageJsonAsString(options, dialect),
    );
  }

  /**
   * Install dependencies for api stub
   *
   * @param {string} dialect database type
   * @return {Promise<boolean>} installed dependencies
   */
  public async installDependencies(dialect: string): Promise<boolean> {
    return new Promise<boolean>((resolve: (value: boolean) => void, reject: (reason: Error) => void): void => {
      console.log(
        `running: ${chalk.green(`npm i --save express body-parser morgan ${this.getDependenciesForDb(dialect)}`)}`,
      );
      exec(
        `cd ${this.filePath} && npm i --save express body-parser morgan ${this.getDependenciesForDb(dialect)}`,
        (errDependencies: Error) => {
          if (errDependencies) {
            return reject(errDependencies);
          }
          console.log(`running: ${chalk.green('npm i --save-dev nodemon')}`);
          exec(`cd ${this.filePath} && npm i --save-dev nodemon`, (errDev: Error) => {
            if (errDev) {
              return reject(errDev);
            }
            resolve(true);
          });
        },
      );
    });
  }

  /**
   * Initialize ODM
   *
   * @param {string} dialect database dialect
   * @returns {Promise<boolean>} initialized odm
   */
  public async initializeODM(dialect: string): Promise<boolean> {
    switch (dialect) {
      case 'MySql': {
        return odmFileOperations.initSequelize(this.filePath);
      }
      default:
        return Promise.reject('Dialect not supported');
    }
  }

  /**
   * Generate config
   * @param {ConnectionData} connection - connection info
   * @param {Schema} schema - database schema tables
   * @returns {Promise<boolean[]>} - true if generated config
   * @memberOf ApiFileOperations
   */
  public async initializeConfig(connection: ConnectionData, schema: Schema): Promise<boolean[]> {
    console.log(`running: ${chalk.green('initialize src/config files')}`);

    return Promise.all([
      configFileOperations.initializeConfig(this.filePath),
      configFileOperations.initializeGetEnvBasedConfig(this.filePath),
      configFileOperations.initializeDbConfig(connection, this.filePath),
      configFileOperations.initializeCorsConfig(this.filePath),
      configFileOperations.initializeExpressConfig(this.filePath),
      configFileOperations.initializeRouterConfig(this.filePath, schema),
      configFileOperations.initializeIndex(this.filePath),
    ]);
  }

  /**
   * Initialize commons
   * @return {Promise<boolean[]>}
   */
  public async initializeCommons(): Promise<boolean[]> {
    console.log(`running: ${chalk.green('initialize src/commons')}`);

    return Promise.all([
      commonsFileOperations.initializeUtil(this.filePath),
      commonsFileOperations.initializeConstants(this.filePath),
    ]);
  }

  /**
   * Initialize ODM
   *
   * @param {string} dialect database dialect
   * @param {Schema} schema source schema for api generation
   * @returns {Promise<boolean[]>} initialized odm
   */
  public async initializeModels(dialect: string, schema: Schema): Promise<boolean[]> {
    console.log(`running: ${chalk.green(`initialize src/models for ${dialect}`)}`);
    switch (dialect) {
      case 'MySql': {
        return modelsFileOperations.initializeSequelizeModels(this.filePath, schema);
      }
      default:
        return Promise.reject('Dialect not supported');
    }
  }

  /**
   * Initialize Repositories
   *
   * @param {string} dialect database dialect
   * @param {Schema} schema source schema for api generation
   * @returns {Promise<boolean[]>} initialized repositories
   */
  public async initializeRepositories(dialect: string, schema: Schema): Promise<boolean[]> {
    console.log(`running: ${chalk.green(`initialize src/repositories for ${dialect}`)}`);
    switch (dialect) {
      case 'MySql': {
        return repositoriesFileOperations.initializeSequelizeRepositories(this.filePath, schema);
      }
      default:
        return Promise.reject('Dialect not supported');
    }
  }

  /**
   * Initialize Services
   * @param schema
   * @return {Promise<Promise<boolean[]>>}
   */
  public async initializeServices(schema: Schema): Promise<boolean[]> {
    console.log(`running: ${chalk.green('initialize src/services')}`);

    return servicesFileOperations.initializeServices(this.filePath, schema);
  }

  /**
   * Initialize Controllers
   * @param schema
   * @return {Promise<boolean[]>}
   */
  public async initializeControllers(schema: Schema): Promise<boolean[]> {
    console.log(`running: ${chalk.green('initialize src/controllers')}`);

    return controllersFileOperations.initializeControllers(this.filePath, schema);
  }

  /**
   * Get required dependencies based on database type
   *
   * @param {string} databaseType database type
   * @return {string} required dependencies for the database type
   */
  private getDependenciesForDb(dialect: string): string {
    switch (dialect) {
      case 'MySql': {
        return 'sequelize sequelize-cli mysql2';
      }
      default: {
        return '';
      }
    }
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
