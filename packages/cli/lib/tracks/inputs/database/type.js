const inquirer = require('inquirer');
const dialect = require('./relational/dialect');

module.exports.questions = [
  {
    name: 'type',
    type: 'list',
    message: 'What type of database are we dealing with?',
    choices: ['relational', 'non-relational'],
  },
];

module.exports.handler = async (data) => {
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
