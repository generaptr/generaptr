import logger from '../../commons/logger';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as databaseTypeTrack from '../inputs/database/databaseType';
import RamlFileOperations from '../../fileOperations/RamlFileOperations';
import { RAMLApplicationInfo, Schema } from '../../commons/types';

export const questions: inquirer.Questions = [
  {
    name: 'output',
    type: 'input',
    message: 'Raml output directory:',
    default: 'raml',
  },
  {
    name: 'name',
    type: 'input',
    message: 'Application name:',
  },
  {
    name: 'version',
    type: 'input',
    message: 'Version:',
  },
  {
    name: 'url',
    type: 'input',
    message: 'Base URL:',
  },
];

export const handler: (data: RAMLApplicationInfo) => Promise<boolean> =
async (data: RAMLApplicationInfo): Promise<boolean> => {
  const ramlFileOperations: RamlFileOperations = new RamlFileOperations(data.output);
  let schemaInfo: Schema;

  return ramlFileOperations.createDirectoryStructure()
    .then(async () => {
      logger.info('reading database schema');

      return inquirer.prompt(databaseTypeTrack.questions).then(databaseTypeTrack.handler);
    })
    .then(async (schema: Schema) => {
      schemaInfo = schema;
      logger.info('generating raml data types');

      return ramlFileOperations.generateSchemaTypeFiles(schemaInfo);
    })
    .then(async () => {
      console.log(chalk.green('DataType files were created for the api spec.'));

      return ramlFileOperations.generateSchemaTypeFiles(schemaInfo);
    })
    .then(async () => ramlFileOperations.generateSchemaExampleFiles(schemaInfo))
    .then(async () => {
      logger.info('generating example files');

      return ramlFileOperations.generateSchemaExamplesFilesFromCache();
    })
    .then(async () => {
      console.log(chalk.green('Example response were created for the api spec.'));
    }).then(async () => ramlFileOperations.generateSchemaApiFiles(schemaInfo, data))
    .then(async () => {
      logger.info('generating the api spec');
      console.log(chalk.green('Api spec has been created.'));

      return Promise.resolve(true);
    })
    .catch(async (e: Error) => {
      logger.error(e.message);

      return Promise.reject(e);
    });
};
