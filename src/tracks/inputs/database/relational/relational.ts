import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import logger from '../../../../commons/logger';
import * as mysql from './mysql';
import { Schema } from '../../../../commons/types';
export const questions: inquirer.Questions = [
  {
    name: 'databaseEngine',
    type: 'list',
    message: 'Database engine:',
    choices: ['MySql', 'Postgresql', 'Sqlite'],
    default: ['Mysql'],
  },
];

export const handler: (data: {databaseEngine: string}) => Promise<Schema> =
async (data: {databaseEngine: string}): Promise<Schema> => {
  switch (data.databaseEngine) {
    case 'MySql': {
      return inquirer.prompt(mysql.questions).then(mysql.handler);
    }
    default: {
      logger.warn(`${data.databaseEngine} not yet supported.`);
      console.log(chalk.yellow(`${data.databaseEngine} not yet supported.`));
    }
  }

  return Promise.reject(undefined);
};
