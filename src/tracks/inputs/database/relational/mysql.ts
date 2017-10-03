import * as chalk from 'chalk';
import MysqlHandler from '../../../../handlers/MysqlHandler';
import * as inquirer from 'inquirer';
import * as mysql from 'mysql2';
import config from '../../../../configs/config';
import { Schema } from '../../../../commons/types';
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
    validate: (value: string): boolean  => {
      if (!isNaN(parseInt(value, config.NUMERIC_BASE))) {
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
    message: 'User (needs read access to information_schema):',
    default: 'root',
  },
  {
    name: 'password',
    type: 'password',
    message: 'Password:',
    default: '',
  },
];

export const handler: (data: mysql.ConnectionOptions) => Promise<Schema> =
  async (data: mysql.ConnectionOptions): Promise<Schema> =>
    new Promise<Schema>((resolve: (data: Schema) => void, reject: (reason: Error) => void): void => {
      try {
        const sqlHandler: MysqlHandler = new MysqlHandler(data);
        sqlHandler.connect();
        sqlHandler.readSchema().then((schema: Schema) => {
          resolve(schema);
          sqlHandler.close();
        }).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
