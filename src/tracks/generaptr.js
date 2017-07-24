const logger = require('../commons/logger');
const chalk = require('chalk');
const inquirer = require('inquirer');

const ramlOutput = require('./outputs/ramlOutput');
const apiOutput = require('./outputs/apiOutput');

exports.questions = [
  {
    name: 'action',
    type: 'list',
    message: 'Choose what you want to generate',
    choices: ['raml', 'api'],
    default: ['raml'],
  },
];

exports.handler = (data) => {
  switch (data.action) {
    case 'raml': {
      return inquirer.prompt(ramlOutput.questions).then(ramlOutput.handler);
    }
    case 'api': {
      return inquirer.prompt(apiOutput.questions).then(apiOutput.handler);
    }
    default: {
      logger.warn(`${data.action} not yet supported.`);
      console.log(chalk.yellow(`${data.action} not yet supported.`));
    }

      return Promise.reject();
  }
};
