import { styleText } from 'node:util';
import inquirer from 'inquirer';
import { operations } from 'generaptr';

import * as database from '../inputs/database.js';

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
  const schema = await database.handler(await inquirer.prompt(database.questions));
  const file = await operations.spec.generateSpec(data.output, data, schema);
  console.log(styleText('green', `OpenAPI specification written to ${file}`));

  return true;
};
