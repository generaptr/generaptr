import inquirer from 'inquirer';
import * as mysql from './mysql.js';

export const questions = [
  {
    name: 'dialect',
    type: 'select',
    message: 'Database engine:',
    choices: ['MySql'],
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
      throw new Error('Database type not supported yet.');
    }
  }

  const connection = await action.handler(await inquirer.prompt(action.questions));

  return { ...connection, dialect: data.dialect };
};
