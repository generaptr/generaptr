import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import { ConnectionData } from '../../../commons/types';
export const questions: inquirer.Questions = [
  {
    name: 'host',
    type: 'input',
    message: 'Host:',
    default: '127.0.0.1',
  },
  {
    name: 'port',
    type: 'input',
    message: 'Port:',
    default: '3306',
    validate: (value: string): boolean => {
      if (!isNaN(parseInt(value, 10))) {
        return true;
      }
      console.log(chalk.red('Port must be a number'));

      return false;
    },
  },
  {
    name: 'database',
    type: 'input',
    message: 'Database:',
    validate: (value: string): boolean => {
      if (value.length) {
        return true;
      }
      console.log(chalk.red('Database not provided'));

      return false;
    },
  },
  {
    name: 'user',
    type: 'input',
    message: 'User:',
    default: 'root',
  },
  {
    name: 'password',
    type: 'password',
    message: 'Password:',
    default: '',
  },
];

export const handler: (data: ConnectionData) => Promise<ConnectionData> =
async (data: ConnectionData): Promise<ConnectionData> => Promise.resolve(data);
