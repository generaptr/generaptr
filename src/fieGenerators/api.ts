import * as chalk from 'chalk';
import { exec } from 'child_process';
import fileUtil from '../commons/utils/file';
import DIRECTORY_STRUCTURE from '../commons/constants/directoryStructure';
import packageJsonGenerator from '../contentGenerators/api/packageJson';
import ormFileOperations from './api/orm';
import configFileOperations from './api/configurations';
import modelsFileOperations from './api/models';
import repositoriesFileOperations from './api/repositories';
import servicesFileOperations from './api/services';
import controllersFileOperations from './api/controllers';
import commonsFileOperations from './api/commons';
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
   * @returns {boolea} created directory structure.
   */
  public createDirectoryStructure(): boolean {
    /* istanbul ignore next */
    if (!fileUtil.isDirectory(this.filePath)) {
      throw new Error('Invalid directory path');
    }
    Object.keys(DIRECTORY_STRUCTURE.API_STRUCTURE).map((directory: string) => {
      fileUtil.createDirectory(
        fileUtil.joinPaths(
          this.filePath,
          DIRECTORY_STRUCTURE.API_STRUCTURE[directory],
        ),
      );
    });

    return true;
  }

  /**
   * Creates package json
   *
   * @param {PackageJsonInfo} options - package json options
   * @param {string} dialect - database dialect
   * @returns {boolean} created package json
   */
  public createPackageJson(options: PackageJsonInfo, dialect: string): boolean {
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
          /* istanbul ignore next */
          if (errDependencies) {
            return reject(errDependencies);
          }
          console.log(`running: ${chalk.green('npm i --save-dev nodemon')}`);
          exec(`cd ${this.filePath} && npm i --save-dev nodemon`, (errDev: Error) => {
            /* istanbul ignore next */
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
   * @returns {Promise<boolean>} initialized orm
   */
  public async initializeORM(dialect: string): Promise<boolean> {
    switch (dialect) {
      case 'MySql': {
        return ormFileOperations.initSequelize(this.filePath);
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
  public initializeConfig(connection: ConnectionData, schema: Schema): boolean {
    console.log(`running: ${chalk.green('initialize src/config files')}`);

    configFileOperations.initializeConfig(this.filePath);
    configFileOperations.initializeGetEnvBasedConfig(this.filePath);
    configFileOperations.initializeDbConfig(connection, this.filePath);
    configFileOperations.initializeCorsConfig(this.filePath);
    configFileOperations.initializeExpressConfig(this.filePath);
    configFileOperations.initializeRouterConfig(this.filePath, schema);
    configFileOperations.initializeIndex(this.filePath);

    return true;
  }

  /**
   * Initialize commons
   * @return {boolean}
   */
  public initializeCommons(): boolean {
    console.log(`running: ${chalk.green('initialize src/commons')}`);

    commonsFileOperations.initializeUtil(this.filePath);
    commonsFileOperations.initializeConstants(this.filePath);

    return true;
  }

  /**
   * Initialize ODM
   *
   * @param {string} dialect database dialect
   * @param {Schema} schema source schema for api generation
   * @returns {boolean} initialized odm
   */
  public initializeModels(dialect: string, schema: Schema): boolean {
    console.log(`running: ${chalk.green(`initialize src/models for ${dialect}`)}`);
    switch (dialect) {
      case 'MySql': {
        return modelsFileOperations.initializeSequelizeModels(this.filePath, schema);
      }
      default:
        throw new Error('Dialect not supported');
    }
  }

  /**
   * Initialize Repositories
   *
   * @param {string} dialect database dialect
   * @param {Schema} schema source schema for api generation
   * @returns {boolean} initialized repositories
   */
  public initializeRepositories(dialect: string, schema: Schema): boolean {
    console.log(`running: ${chalk.green(`initialize src/repositories for ${dialect}`)}`);
    switch (dialect) {
      case 'MySql': {
        return repositoriesFileOperations.initializeSequelizeRepositories(this.filePath, schema);
      }
      default:
        throw new Error('Dialect not supported');
    }
  }

  /**
   * Initialize Services
   * @param schema
   * @return {boolean}
   */
  public initializeServices(schema: Schema): boolean {
    console.log(`running: ${chalk.green('initialize src/services')}`);

    return servicesFileOperations.initializeServices(this.filePath, schema);
  }

  /**
   * Initialize Controllers
   * @param schema
   * @return {boolean}
   */
  public initializeControllers(schema: Schema): boolean {
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
