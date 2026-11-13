const inquirer = require('inquirer');
const mysql = require('./mysql');

module.exports.questions = [
  {
    name: 'dialect',
    type: 'list',
    message: 'Database engine:',
    choices: ['MySql'],
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
      throw new Error('Database type not supported yet.');
    }
  }


  const connection = action.handler(await inquirer.prompt(action.questions));
  Object.assign(connection, { dialect: data.dialect });

  return connection;
};
