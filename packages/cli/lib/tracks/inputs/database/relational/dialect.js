import inquirer from 'inquirer';
import * as mysql from './mysql.js';

export const questions = [
  {
    name: 'dialect',
    type: 'select',
    message: 'Database engine:',
    choices: ['MySql', 'Postgresql', 'Sqlite'],
  },
];

export const handler = async (data) => {
  let action;
  switch (data.dialect) {
    case 'MySql': {
      action = mysql;
      break;
    }
    default: {
      throw new Error(`${data.dialect} not yet supported.`);
    }
  }

  return action.handler(await inquirer.prompt(action.questions));
};
