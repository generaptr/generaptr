const inquirer = require('inquirer');
const type = require('./database/type');
const raml = require('./raml/raml');

module.exports.questions = [
  {
    name: 'input',
    type: 'list',
    message: 'From where should we read the schema?',
    choices: ['Existing Database', 'RAML specification'],
  },
];

module.exports.handler = async (data) => {
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
