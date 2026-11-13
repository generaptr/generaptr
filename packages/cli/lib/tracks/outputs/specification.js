import { styleText } from 'node:util';
import inquirer from 'inquirer';
import { operations } from 'generaptr';

import * as type from '../inputs/database/type.js';

const { raml: RAML } = operations;

export const questions = [
  {
    name: 'output',
    type: 'input',
    message: 'RAML specification output directory:',
    default: 'raml',
  },
  {
    name: 'name',
    type: 'input',
    message: 'Application name:',
  },
  {
    name: 'version',
    type: 'input',
    message: 'Version:',
  },
  {
    name: 'url',
    type: 'input',
    message: 'Base URL:',
  },
];

export const handler = async (data) => {
  const raml = new RAML(data.output);

  const schemaInfo = await type.handler(await inquirer.prompt(type.questions));

  await raml.generateSchemaTypeFiles(schemaInfo);
  await raml.generateSchemaExampleFiles(schemaInfo);
  await raml.generateSchemaExamplesFilesFromCache();
  await raml.generateSchemaApiFiles(schemaInfo, data);

  console.log(styleText('green', `RAML Specification has been generated in: ${data.output}`));

  return true;
};
