import inquirer from 'inquirer';
import * as dialect from './relational/dialect.js';

export const questions = [
  {
    name: 'type',
    type: 'select',
    message: 'What type of database are we dealing with?',
    choices: ['relational', 'non-relational'],
  },
];

export const handler = async (data) => {
  let action;
  switch (data.type) {
    case 'relational':
      action = dialect;
      break;
    default: {
      throw new Error('Non-relational databases not supported yet.');
    }
  }

  return action.handler(await inquirer.prompt(action.questions));
};
