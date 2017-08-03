import logger from '../../../commons/logger';
import * as chalk from 'chalk';
import * as relational from './relational/relational';
import * as inquirer from 'inquirer';
import { Schema } from '../../../commons/types';

export const questions: inquirer.Questions = [
  {
    name: 'databaseType',
    type: 'list',
    message: 'Choose database type',
    choices: ['relational', 'non-relational'],
    default: ['relational'],
  },
];

export const handler: (data: {databaseType: string}) => Promise<Schema> =
async (data: {databaseType: string}): Promise<Schema> => {
  switch (data.databaseType) {
    case 'relational':
      return inquirer.prompt(relational.questions).then(relational.handler);
    default: {
      logger.warn('Non-relational databases not supported yet.');
      console.log(chalk.yellow('Non-relational databases not supported yet.'));
    }
  }

  return Promise.reject(undefined);
};
