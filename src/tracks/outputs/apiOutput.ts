import logger from '../../commons/logger';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as input from '../inputs/input';
import ApiFileOperations from '../../fileOperations/ApiFileOperations';
import config from '../../configs/config';
import * as dialect from './database/dialect';

import { Schema, ConnectionData, PackageJsonInfo } from '../../commons/types';

export const questions: inquirer.Questions = [
  {
    name: 'output',
    type: 'input',
    message: 'Api output directory:',
    default: 'api',
  },
  {
    name: 'name',
    type: 'input',
    message: 'Application name (lower case with dashes):',
  },
  {
    name: 'description',
    type: 'input',
    message: 'Application description:',
  },
  {
    name: 'version',
    type: 'input',
    message: 'Version:',
    default: '1.0.0',
  },
  {
    name: 'license',
    type: 'input',
    message: 'Licence:',
    default: 'ISC',
  },
  {
    name: 'author',
    type: 'input',
    message: 'Author:',
  },
];

export const handler: (data: PackageJsonInfo) => Promise<boolean> =
async (data: PackageJsonInfo): Promise<boolean> => {
  const apiFileOperations: ApiFileOperations = new ApiFileOperations(data.output);
  let schema: Schema;
  let connection: ConnectionData;

  logger.info('generating api');

  return apiFileOperations.createDirectoryStructure()
    .then(async () => {
      logger.info('reading input source');

      return inquirer.prompt(input.questions).then(input.handler);
    })
    .then(async (parsedSchema: Schema) => {
      schema = parsedSchema;
      logger.info(JSON.stringify(schema, undefined, config.DEFAULT_INDENTATION_SPACE_COUNT));

      return inquirer.prompt(dialect.questions).then(dialect.handler);
    })
    .then(async (connectionData: ConnectionData) => {
      connection = connectionData;
      logger.info(JSON.stringify(connection, undefined, 2));
      logger.info('requesting consent for installing packages');

      return inquirer.prompt([{
        name: 'allow',
        type: 'confirm',
        message: chalk.yellow('Allow generaptr to install required packages:'),
      }]);
    })
    .then(async (consent: {allow: boolean}) => {
      if (!consent.allow) {
        return Promise.reject('User did not agree that generaptr should install required packages');
      }
      logger.info('generating package.json');

      return apiFileOperations.createPackageJson(data, connection.dialect);
    })
    .then(async () => {
      logger.info('installing dependencies');

      return apiFileOperations.installDependencies(connection.dialect);
    })
    .then(async () => {
      logger.info('initialize odm');

      return apiFileOperations.initializeORM(connection.dialect);
    })
    .then(async () => {
      logger.info('installing config');

      return apiFileOperations.initializeConfig(connection, schema);
    })
    .then(async () => {
      logger.info('installing commons');

      return apiFileOperations.initializeCommons();
    })
    .then(async () => {
      logger.info('installing models');

      return apiFileOperations.initializeModels(connection.dialect, schema);
    })
    .then(async () => {
      logger.info('installing repositories');

      return apiFileOperations.initializeRepositories(connection.dialect, schema);
    })
    .then(async () => {
      logger.info('installing services');

      return apiFileOperations.initializeServices(schema);
    })
    .then(async () => {
      logger.info('installing controllers');

      return apiFileOperations.initializeControllers(schema);
    })
    .then(async () => {
      logger.info('finished api generation');

      return Promise.resolve(true);
    })
    .catch(async (e: Error) => {
      logger.error(e.message);

      return Promise.reject(e);
    });
};
