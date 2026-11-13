const inquirer = require('inquirer');
const mysql = require('./mysql');

module.exports.questions = [
  {
    name: 'dialect',
    type: 'list',
    message: 'Database engine:',
    choices: ['MySql', 'Postgresql', 'Sqlite'],
  },
];

module.exports.handler = async (data) => {
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
