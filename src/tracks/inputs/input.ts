import logger from '../../commons/logger';
import * as chalk from 'chalk';
import * as databaseType from './database/databaseType';
import * as raml from './raml/raml';
import * as inquirer from 'inquirer';
import { Schema } from '../../commons/types';

export const questions: inquirer.Questions = [
  {
    name: 'input',
    type: 'list',
    message: 'Choose input source',
    choices: ['database', 'raml'],
    default: ['database'],
  },
];

export const handler: (data: {input: string}) => Promise<Schema> =
async (data: {input: string}): Promise<Schema> => {
  switch (data.input) {
    case 'database':
      return inquirer.prompt(databaseType.questions).then(databaseType.handler);
    case 'raml':
      return inquirer.prompt(raml.questions).then(raml.handler);
    default: {
      logger.warn('Input source not supported yet.');
      console.log(chalk.yellow('Input source not supported yet.'));
    }
  }

  return Promise.reject(undefined);
};
