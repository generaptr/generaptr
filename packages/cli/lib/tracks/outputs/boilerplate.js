import { styleText } from 'node:util';
import inquirer from 'inquirer';
import { operations } from 'generaptr';

import * as source from '../inputs/source.js';

const { api } = operations;

export const questions = [
  {
    name: 'output',
    type: 'input',
    message: 'Boilerplate API output directory:',
    default: 'api',
  },
  {
    name: 'name',
    type: 'input',
    message: 'Application name (lower case with dashes):',
  },
  {
    name: 'description',
    type: 'input',
    message: 'Application description:',
  },
  {
    name: 'version',
    type: 'input',
    message: 'Version:',
    default: '1.0.0',
  },
  {
    name: 'license',
    type: 'input',
    message: 'Licence:',
    default: 'ISC',
  },
  {
    name: 'author',
    type: 'input',
    message: 'Author:',
  },
];

export const handler = async (data) => {
  const tables = await source.handler(await inquirer.prompt(source.questions));

  const files = await api.generateApi(data.output, data, tables);
  console.log(styleText('green', `Generated ${files.length} files in ${data.output}`));

  const consent = await inquirer.prompt([{
    name: 'install',
    type: 'confirm',
    message: styleText('yellow', 'Run npm install in the generated API?'),
  }]);
  if (consent.install) {
    await api.installApi(data.output);
  }

  return true;
};
