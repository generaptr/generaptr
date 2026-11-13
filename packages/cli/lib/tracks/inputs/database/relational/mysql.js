import { styleText } from 'node:util';
import { handlers } from 'generaptr';

export const questions = [
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
    validate: (value) => (Number.isInteger(Number(value)) ? true : 'Port must be a number'),
  },
  {
    name: 'database',
    type: 'input',
    message: 'Database:',
    validate: (value) => {
      if (value.length) {
        return true;
      }

      console.log(styleText('red', 'Database not provided'));

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

export const handler = async (data) => {
  const reader = new handlers.MySql(data);
  await reader.connect();
  const tables = await reader.readTables();
  await reader.close();

  return tables;
};
