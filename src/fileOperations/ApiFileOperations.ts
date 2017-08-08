import * as chalk from 'chalk';
import { exec } from 'child_process';
import fileUtil from '../commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../commons/constants/directoryStructure';
import packageJsonGenerator from '../generators/api/packageJson';
import modelGenerator from '../generators/api/models';
import { PackageJsonInfo, ConnectionData } from '../commons/types';
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
    console.log(`running: ${chalk.green('init package.json')}`);

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
   * Initializes sequelize
   * @returns {Promise<boolean>} initialized sequelize
   * @memberof ApiFileOperations
   */
  public async initSequelize(): Promise<boolean> {
    return new Promise<boolean>((resolve: (data: boolean) => void, reject: (reason: Error) => void): void => {
      console.log(`running: ${chalk.green('sequelize init')}`);
      exec(
        `cd ${this.filePath} && ./node_modules/.bin/sequelize init && rm -rf ./config ./models`,
        (err: Error, stdout: string, stderr: string) => {
          if (err) {
            console.log(stdout, stderr);

            return reject(err);
          }

          return fileUtil.writeFile(
            `${this.filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.MODELS}/index.js`,
            modelGenerator.sequelize.getModelsRegistry(),
          )
          .then(() => resolve(true));
      });
    });
  }

  /**
   * Generate config
   * @param {ConnectionData} connection - connection info
   * @returns {Promise<boolean>} - true if generated config
   * @memberof ApiFileOperations
   */
  public async initConfig(connection: ConnectionData): Promise<boolean> {
    console.log(`running: ${chalk.green('init src/config/index.js')}`);
    let config: string = '';
    switch (connection.dialect) {
      case 'MySql':
        config = modelGenerator.sequelize.getConfig(connection);
      default:
    }

    return fileUtil.writeFile(
      `${this.filePath}/${DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG}/index.js`,
      config,
    );
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
