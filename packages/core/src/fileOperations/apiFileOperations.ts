import chalk from 'chalk';
import { run } from '../commons/utils/run';
import fileUtil from '../commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../commons/constants/directoryStructure';
import packageJsonGenerator from '../generators/api/packageJson';
import ormFileOperations from './api/ormFileOperations';
import configFileOperations from './api/configurationsFileOperations';
import modelsFileOperations from './api/modelsFileOperations';
import repositoriesFileOperations from './api/repositoriesFileOperations';
import servicesFileOperations from './api/servicesFileOperations';
import controllersFileOperations from './api/controllersFileOperations';
import commonsFileOperations from './api/commonsFileOperations';
import { PackageJsonInfo, ConnectionData, Schema } from '../commons/types';
// Generated code calls `sequelize.import`, which Sequelize 6 removed.
const BASE_DEPENDENCIES: string[] = ['express@4.22.3', 'body-parser@1.20.9', 'morgan@1.12.1'];
const MYSQL_DEPENDENCIES: string[] = ['sequelize@5.22.5', 'sequelize-cli@5.5.1', 'mysql2@3.24.6'];
const DEV_DEPENDENCIES: string[] = ['nodemon@3.1.14'];

/**
 * Class which implements the logic for implementing api generation file related actions.
 *
 * @export
 */
export default class ApiFileOperations {

  /**
   * Path to the folder where the api will be generated.
   *
   * @memberOf ApiFileOperations
   */
  private readonly filePath: string;

  public constructor(filePath: string) {
    this.filePath = fileUtil.normalizePath(filePath);
  }

  /**
   * Create directory structure for the application
   * @returns  created directory structure.
   */
  public async createDirectoryStructure(): Promise<boolean[]> {
    const promises: [Promise<boolean>] = [Promise.resolve(true)];
    /* istanbul ignore next */
    if (!fileUtil.isDirectory(this.filePath)) {
      return Promise.reject('Invalid directory path');
    }
    Object.keys(DIRECTORY_STRUCTURE.API_STRUCTURE)
      .forEach((directory: string) => {
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
   * @param options - package json options
   * @param dialect - database dialect
   * @returns created package json
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
   * @param dialect database type
   * @return installed dependencies
   */
  public async installDependencies(dialect: string): Promise<boolean> {
    const dependencies: string[] = [...BASE_DEPENDENCIES, ...this.getDependenciesForDb(dialect)];
    console.log(`running: ${chalk.green(`npm i --save ${dependencies.join(' ')}`)}`);
    await run('npm', ['i', '--save', ...dependencies], this.filePath);
    console.log(`running: ${chalk.green(`npm i --save-dev ${DEV_DEPENDENCIES.join(' ')}`)}`);
    await run('npm', ['i', '--save-dev', ...DEV_DEPENDENCIES], this.filePath);

    return true;
  }

  /**
   * Initialize ODM
   *
   * @param dialect database dialect
   * @returns initialized orm
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
   * @param connection - connection info
   * @param schema - database schema tables
   * @returns  - true if generated config
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
   * @param dialect database dialect
   * @param schema source schema for api generation
   * @returns  initialized odm
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
   * @param dialect database dialect
   * @param schema source schema for api generation
   * @returns  initialized repositories
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
   */
  public async initializeServices(schema: Schema): Promise<boolean[]> {
    console.log(`running: ${chalk.green('initialize src/services')}`);

    return servicesFileOperations.initializeServices(this.filePath, schema);
  }

  /**
   * Initialize Controllers
   */
  public async initializeControllers(schema: Schema): Promise<boolean[]> {
    console.log(`running: ${chalk.green('initialize src/controllers')}`);

    return controllersFileOperations.initializeControllers(this.filePath, schema);
  }

  /**
   * Get required dependencies based on database type
   *
   * @param databaseType database type
   * @return required dependencies for the database type
   */
  private getDependenciesForDb(dialect: string): string[] {
    return dialect === 'MySql' ? MYSQL_DEPENDENCIES : [];
  }

  /**
   * Returns file path.
   *
   * @returns file path
   */
  public getFilePath(): string {
    return this.filePath;
  }

}
