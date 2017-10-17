import modelGenerator from '../../contentGenerators/api/models';
import fileUtil from '../../commons/utils/file';
import DIRECTORY_STRUCTURE from '../../commons/constants/directoryStructure';
import config from '../../contentGenerators/api/config/config';
import cors from '../../contentGenerators/api/config/cors';
import express from '../../contentGenerators/api/config/express';
import router from '../../contentGenerators/api/config/router';
import index from '../../contentGenerators/api/config/index';
import { ConnectionData, Schema } from '../../commons/types';

/**
 * Class which implements logic for creating configuration files
 *
 * @export
 * @class ConfigurationFileOperations
 */
export class ConfigurationFileOperations {

  /**
   * Generate general configuration
   * @param {string} filePath - file path where api will be generated
   * @return {boolean}
   */
  public initializeConfig(filePath: string): boolean {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG, 'config.js'),
      config.getConfig(),
    );
  }

  /**
   * Generate get env based config util class
   * @param {string} filePath - file path where api will be generated
   * @return {boolean}
   */
  public initializeGetEnvBasedConfig(filePath: string): boolean {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG, 'index.js'),
      config.getEnvBasedConfig(),
    );
  }

  /**
   * Generate database configuration
   * @param {Connection data} connection - connection info
   * @param {string} filePath - file path where api will be generated
   * @return {boolean}
   */
  public initializeDbConfig(connection: ConnectionData, filePath: string): boolean {
    let configContent: string = '';
    switch (connection.dialect) {
      case 'MySql':
        configContent = modelGenerator.sequelize.getConfig(connection);
      default:
    }

    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG, 'database.js'),
      configContent,
    );
  }

  /**
   * Initialize cors configuration
   * @param filePath - file path where api will be generated
   * @return {boolean} - true if cors file was successfully created
   */
  public initializeCorsConfig(filePath: string): boolean {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.MIDDLEWARES, 'cors.js'),
      cors.getCorsConfig(),
    );
  }

  /**
   * Initialize express configuration
   * @param filePath - file path where api will be generated
   * @return {boolean} - true if express file was successfully created
   */
  public initializeExpressConfig(filePath: string): boolean {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG, 'express.js'),
      express.getExpressConfig(),
    );
  }

  /**
   * Initialize express configuration
   * @param filePath - file path where api will be generated
   * @param schema - database schema table
   * @return {boolean}
   */
  public initializeRouterConfig(filePath: string, schema: Schema): boolean {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.CONFIG, 'router.js'),
      router.getRouterConfig(schema),
    );
  }

  /**
   * Initialize main index.js file
   * @param filePath - file path where api will be generated
   * @return {boolean} - true if index file was created
   */
  public initializeIndex(filePath: string): boolean {
    return fileUtil.writeFile(
      fileUtil.joinPaths(filePath, DIRECTORY_STRUCTURE.API_STRUCTURE.SRC, 'index.js'),
      index.getIndex(),
    );
  }
}

export default new ConfigurationFileOperations();
