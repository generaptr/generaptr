import inquirer from 'inquirer';
import { operations } from 'generaptr';

import * as database from './database.js';

export const questions = [
  {
    name: 'source',
    type: 'select',
    message: 'Where should generaptr read the tables from?',
    choices: ['Database', 'OpenAPI 3.1 file (YAML or JSON)'],
  },
];

export const handler = async (data) => {
  if (data.source === 'Database') {
    return database.handler(await inquirer.prompt(database.questions));
  }
  const { path, dialect } = await inquirer.prompt([
    {
      name: 'path',
      type: 'input',
      message: 'Path to the OpenAPI file:',
      validate: (value) => (value.length ? true : 'Path to the OpenAPI file not provided'),
    },
    {
      name: 'dialect',
      type: 'select',
      message: 'Database engine for the generated API:',
      choices: [{ name: 'MySQL', value: 'mysql' }, { name: 'PostgreSQL', value: 'postgresql' }],
    },
  ]);

  return operations.spec.readOpenApi(path, dialect);
};
