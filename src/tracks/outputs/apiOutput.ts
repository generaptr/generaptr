import logger from '../../commons/logger';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as input from '../inputs/input';
import ApiFileOperations from '../../fileOperations/ApiFileOperations';
import { Schema } from '../../commons/types';
import config from '../../configs/config';

export const questions: inquirer.Questions = [
  {
    name: 'output',
    type: 'input',
    message: 'Api output directory:',
    default: 'api',
  },
];

export const handler: (data: {output: string}) => Promise<boolean> =
async (data: {output: string}): Promise<boolean> => {
  const apiFileOperations: ApiFileOperations = new ApiFileOperations(data.output);

  return apiFileOperations.createDirectoryStructure()
    .then(async () => {
      logger.info('reading input source');

      return inquirer.prompt(input.questions).then(input.handler);
    })
    .then(async (schema: Schema) => {
      logger.info(JSON.stringify(schema, undefined, config.DEFAULT_INDENTATION_SPACE_COUNT));
      logger.info('generating api');
      console.log(chalk.green('Api spec has been created.'));

      return Promise.resolve(true);
    })
    .catch(async (e: Error) => {
      logger.error(e.message);

      return Promise.reject(e);
    });
};
