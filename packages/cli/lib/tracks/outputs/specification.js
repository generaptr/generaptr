import { styleText } from 'node:util';
import inquirer from 'inquirer';
import { operations } from 'generaptr';

import * as mysql from '../inputs/database/relational/mysql.js';

export const questions = [
  {
    name: 'output',
    type: 'input',
    message: 'OpenAPI output directory:',
    default: 'spec',
  },
  {
    name: 'name',
    type: 'input',
    message: 'API name:',
  },
  {
    name: 'version',
    type: 'input',
    message: 'Version:',
    default: '1.0.0',
  },
  {
    name: 'description',
    type: 'input',
    message: 'Description:',
  },
];

export const handler = async (data) => {
  const tables = await mysql.handler(await inquirer.prompt(mysql.questions));
  const file = await operations.spec.generateSpec(data.output, data, tables);
  console.log(styleText('green', `OpenAPI specification written to ${file}`));

  return true;
};
