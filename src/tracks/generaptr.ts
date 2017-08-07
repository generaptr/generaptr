import logger from '../commons/logger';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';

import * as ramlOutput from './outputs/ramlOutput';
import * as apiOutput from './outputs/apiOutput';

export const questions: inquirer.Questions = [
  {
    name: 'action',
    type: 'list',
    message: 'Choose what you want to generate',
    choices: ['raml', 'api'],
    default: ['raml'],
  },
];

export const handler: (data: {action: string}) => Promise<boolean> =
async (data: {action: string}): Promise<boolean> => {
  switch (data.action) {
    case 'raml': {
      return inquirer.prompt(ramlOutput.questions).then(ramlOutput.handler);
    }
    case 'api': {
      return inquirer.prompt(apiOutput.questions).then(apiOutput.handler);
    }
    default: {
      logger.warn(`${data.action} not yet supported.`);
      console.log(chalk.yellow(`${data.action} not yet supported.`));
    }
  }

  return Promise.reject(undefined);
};
