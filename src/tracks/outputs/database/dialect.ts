import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as mysql from './mysql';
import logger from '../../../commons/logger';
import { ConnectionData } from '../../../commons/types';

export const questions: inquirer.Questions = [
  {
    name: 'dialect',
    type: 'list',
    message: 'Choose api database type',
    choices: ['MySql'],
    default: ['MySql'],
  },
];

export const handler: (data: {dialect: string}) => Promise<ConnectionData> =
async (data: {dialect: string}): Promise<ConnectionData> => {
  switch (data.dialect) {
    case 'MySql':
      return inquirer.prompt(mysql.questions).then(mysql.handler).then(async (connection: ConnectionData) => {
        Object.assign(connection, {dialect: data.dialect});

        return Promise.resolve(connection);
      });
    default: {
      logger.warn('Database type not supported yet.');
      console.log(chalk.yellow('Database type not supported yet.'));

      return Promise.reject(false);
    }
  }
};
