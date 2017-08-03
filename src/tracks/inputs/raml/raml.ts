import * as chalk from 'chalk';
import RamlHandler from '../../../handlers/RamlHandler';
import * as inquirer from 'inquirer';
import { Schema } from '../../../commons/types';

export const questions: inquirer.Questions = [
  {
    name: 'path',
    type: 'input',
    message: 'Path to raml spec file',
    validate: (value: string): boolean => {
      if (value.length) {
        return true;
      }
      console.log(chalk.red('Path to raml spec file not provided.'));

      return false;
    },
  },
];

export const handler: (data: {path: string}) => Promise<Schema> =
async (data: {path: string}): Promise<Schema> => {
  const ramlHandler: RamlHandler = new RamlHandler(data);

  return ramlHandler.parseSchema();
};
