import inquirer from 'inquirer';
import { handlers } from 'generaptr';

const ENGINES = {
  MySQL: { Handler: handlers.MySql, port: '3306', user: 'root', extra: [] },
  PostgreSQL: {
    Handler: handlers.Postgres,
    port: '5432',
    user: 'postgres',
    extra: [{ name: 'schema', type: 'input', message: 'Schema:', default: 'public' }],
  },
};

export const questions = [
  {
    name: 'engine',
    type: 'select',
    message: 'Database engine:',
    choices: Object.keys(ENGINES),
  },
];

const connectionQuestions = ({ port, user, extra }) => [
  { name: 'host', type: 'input', message: 'Host:', default: '127.0.0.1' },
  {
    name: 'port',
    type: 'input',
    message: 'Port:',
    default: port,
    validate: (value) => (Number.isInteger(Number(value)) ? true : 'Port must be a number'),
  },
  {
    name: 'database',
    type: 'input',
    message: 'Database:',
    validate: (value) => (value.length ? true : 'Database not provided'),
  },
  { name: 'user', type: 'input', message: 'User (needs read access to the schema catalog):', default: user },
  { name: 'password', type: 'password', message: 'Password:', default: '' },
  ...extra,
];

export const handler = async ({ engine }) => {
  const { Handler, ...defaults } = ENGINES[engine];
  const reader = new Handler(await inquirer.prompt(connectionQuestions(defaults)));
  try {
    await reader.connect();
    return await reader.readSchema();
  } finally {
    await reader.close();
  }
};
