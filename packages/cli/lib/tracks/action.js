const inquirer = require('inquirer');
const specification = require('./outputs/specification');
const boilerplate = require('./outputs/boilerplate');

module.exports.questions = [
  {
    name: 'action',
    type: 'list',
    message: 'What would you want to generate?',
    choices: ['Boilerplate API', 'RAML Specification'],
  },
];

module.exports.handler = async (data) => {
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
