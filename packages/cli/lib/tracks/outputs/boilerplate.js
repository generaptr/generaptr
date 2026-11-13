import { styleText } from 'node:util';
import inquirer from 'inquirer';
import { operations } from 'generaptr';

import * as source from '../inputs/source.js';

const { api, web } = operations;

export const questions = [
  {
    name: 'output',
    type: 'input',
    message: 'Boilerplate API output directory:',
    default: 'api',
  },
  {
    name: 'webOutput',
    type: 'input',
    message: 'Web app output directory (empty for none):',
    default: 'web',
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
  const schema = await source.handler(await inquirer.prompt(source.questions));

  const files = await api.generateApi(data.output, data, schema);
  console.log(styleText('green', `Generated ${files.length} files in ${data.output}`));
  if (data.webOutput) {
    const webFiles = await web.generateWeb(data.webOutput, data, schema);
    console.log(styleText('green', `Generated ${webFiles.length} files in ${data.webOutput}`));
  }

  const consent = await inquirer.prompt([{
    name: 'install',
    type: 'confirm',
    message: styleText('yellow', 'Run npm install in the generated projects?'),
  }]);
  if (consent.install) {
    await api.installApi(data.output);
    if (data.webOutput) {
      await web.installWeb(data.webOutput);
    }
  }

  return true;
};
