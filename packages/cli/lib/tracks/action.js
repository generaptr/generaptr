import inquirer from 'inquirer';
import * as specification from './outputs/specification.js';
import * as boilerplate from './outputs/boilerplate.js';

export const questions = [
  {
    name: 'action',
    type: 'select',
    message: 'What would you want to generate?',
    choices: ['Boilerplate API', 'RAML Specification'],
  },
];

export const handler = async (data) => {
  let action;
  switch (data.action) {
    case 'RAML Specification': {
      action = specification;
      break;
    }
    case 'Boilerplate API': {
      action = boilerplate;
      break;
    }
    default: {
      throw new Error(`${data.action} not yet supported.`);
    }
  }

  return action.handler(await inquirer.prompt(action.questions));
};
