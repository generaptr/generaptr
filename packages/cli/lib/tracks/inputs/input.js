import inquirer from 'inquirer';
import * as type from './database/type.js';
import * as raml from './raml/raml.js';

export const questions = [
  {
    name: 'input',
    type: 'select',
    message: 'From where should we read the schema?',
    choices: ['Existing Database', 'RAML specification'],
  },
];

export const handler = async (data) => {
  let action;
  switch (data.input) {
    case 'Existing Database':
      action = type;
      break;
    case 'RAML specification':
      action = raml;
      break;
    default: {
      throw new Error('Input source not supported yet.');
    }
  }

  return action.handler(await inquirer.prompt(action.questions));
};
